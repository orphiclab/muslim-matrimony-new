import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PhotoVisibility, ModerationStatus, RequestStatus } from '@prisma/client';

@Injectable()
export class PhotoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async uploadPhoto(childProfileId: string, file: Express.Multer.File, visibility: PhotoVisibility = PhotoVisibility.BLURRED) {
    const uploadResult = await this.cloudinary.uploadImage(file, 'profiles');

    return this.prisma.photo.create({
      data: {
        childProfileId,
        url: uploadResult.secure_url,
        key: uploadResult.public_id,
        visibility,
        status: ModerationStatus.PENDING,
      },
    });
  }

  async getPhotos(profileId: string) {
    return this.prisma.photo.findMany({
      where: { childProfileId: profileId },
    });
  }

  async deletePhoto(photoId: string, profileId: string) {
    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, childProfileId: profileId },
    });

    if (!photo) throw new NotFoundException('Photo not found');

    if (photo.key) await this.cloudinary.deleteImage(photo.key);

    return this.prisma.photo.delete({ where: { id: photoId } });
  }

  async requestAccess(requesterId: string, targetId: string) {
    return this.prisma.photoAccessRequest.create({
      data: {
        requesterProfileId: requesterId,
        targetProfileId: targetId,
        status: RequestStatus.PENDING,
      },
    });
  }

  async getPendingRequests(userId: string) {
    // Find requests where the target profile belongs to one of this user's child profiles
    return this.prisma.photoAccessRequest.findMany({
      where: {
        status: RequestStatus.PENDING,
        target: { userId },
      },
      include: {
        requester: { select: { id: true, name: true, memberId: true } },
        target: { select: { id: true, name: true, memberId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveRequest(requestId: string, targetId: string) {
    return this.prisma.photoAccessRequest.updateMany({
      where: { id: requestId, targetProfileId: targetId },
      data: { status: RequestStatus.APPROVED },
    });
  }

  async rejectRequest(requestId: string, targetId: string) {
    return this.prisma.photoAccessRequest.updateMany({
      where: { id: requestId, targetProfileId: targetId },
      data: { status: RequestStatus.REJECTED },
    });
  }
}
