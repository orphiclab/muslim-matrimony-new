import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InterestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  private async assertOwns(userId: string, profileId: string) {
    const profile = await this.prisma.childProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException('You do not own this profile');
    return profile;
  }

  async sendInterest(userId: string, senderProfileId: string, receiverProfileId: string, message?: string) {
    const sender = await this.assertOwns(userId, senderProfileId);
    if (senderProfileId === receiverProfileId)
      throw new BadRequestException('Cannot send interest to your own profile');

    const receiver = await this.prisma.childProfile.findUnique({ where: { id: receiverProfileId } });
    if (!receiver) throw new NotFoundException('Target profile not found');

    const existing = await (this.prisma as any).interestRequest.findUnique({
      where: { senderProfileId_receiverProfileId: { senderProfileId, receiverProfileId } },
    });
    if (existing) throw new ConflictException('Interest already sent');

    const interest = await (this.prisma as any).interestRequest.create({
      data: { senderProfileId, receiverProfileId, message: message ?? null, status: 'PENDING' },
    });

    // Emit event for notifications
    this.events.emit('INTEREST_SENT', {
      senderProfileId,
      receiverProfileId,
      senderName: sender.showRealName ? sender.name : (sender as any).nickname ?? sender.name,
    });

    return { success: true, message: 'Interest sent!', data: interest };
  }

  async respondInterest(userId: string, interestId: string, receiverProfileId: string, action: 'ACCEPTED' | 'DECLINED') {
    const receiver = await this.assertOwns(userId, receiverProfileId);
    const interest = await (this.prisma as any).interestRequest.findFirst({
      where: { id: interestId, receiverProfileId },
    });
    if (!interest) throw new NotFoundException('Interest request not found');
    if (interest.status !== 'PENDING') throw new ConflictException('Interest already actioned');

    const updated = await (this.prisma as any).interestRequest.update({
      where: { id: interestId },
      data: { status: action, updatedAt: new Date() },
    });

    if (action === 'ACCEPTED') {
      this.events.emit('INTEREST_ACCEPTED', {
        senderProfileId: interest.senderProfileId,
        receiverProfileId,
        receiverName: receiver.showRealName ? receiver.name : (receiver as any).nickname ?? receiver.name,
      });
    }

    return { success: true, data: updated };
  }

  async getReceived(userId: string, profileId: string) {
    await this.assertOwns(userId, profileId);
    const items = await (this.prisma as any).interestRequest.findMany({
      where: { receiverProfileId: profileId },
      include: {
        sender: {
          select: {
            id: true, memberId: true, name: true, showRealName: true, nickname: true,
            gender: true, city: true, occupation: true,
            photos: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  async getSent(userId: string, profileId: string) {
    await this.assertOwns(userId, profileId);
    const items = await (this.prisma as any).interestRequest.findMany({
      where: { senderProfileId: profileId },
      include: {
        receiver: {
          select: {
            id: true, memberId: true, name: true, showRealName: true, nickname: true,
            gender: true, city: true, occupation: true,
            photos: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  async checkInterest(userId: string, senderProfileId: string, receiverProfileId: string) {
    await this.assertOwns(userId, senderProfileId);
    const interest = await (this.prisma as any).interestRequest.findUnique({
      where: { senderProfileId_receiverProfileId: { senderProfileId, receiverProfileId } },
    });
    return { success: true, data: interest ?? null };
  }

  async withdrawInterest(userId: string, senderProfileId: string, receiverProfileId: string) {
    await this.assertOwns(userId, senderProfileId);
    const interest = await (this.prisma as any).interestRequest.findUnique({
      where: { senderProfileId_receiverProfileId: { senderProfileId, receiverProfileId } },
    });
    if (!interest) throw new NotFoundException('Interest not found');
    await (this.prisma as any).interestRequest.delete({ where: { id: interest.id } });
    return { success: true, message: 'Interest withdrawn' };
  }
}
