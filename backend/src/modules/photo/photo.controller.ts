import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, UseGuards, Body, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PhotoVisibility } from '@prisma/client';

@Controller('photo')
@UseGuards(JwtAuthGuard)
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload/:profileId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('profileId') profileId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('visibility') visibility?: PhotoVisibility,
  ) {
    return this.photoService.uploadPhoto(profileId, file, visibility);
  }

  @Get(':profileId')
  async getPhotos(@Param('profileId') profileId: string) {
    return this.photoService.getPhotos(profileId);
  }

  @Delete(':id/profile/:profileId')
  async deletePhoto(
    @Param('id') photoId: string,
    @Param('profileId') profileId: string,
  ) {
    return this.photoService.deletePhoto(photoId, profileId);
  }

  @Post('access/request')
  async requestAccess(
    @Body('requesterId') requesterId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.photoService.requestAccess(requesterId, targetId);
  }

  @Get('access/pending')
  async getPendingRequests(@Req() req: any) {
    return this.photoService.getPendingRequests(req.user.userId || req.user.id);
  }

  @Post('access/:requestId/approve')
  async approveRequest(
    @Param('requestId') requestId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.photoService.approveRequest(requestId, targetId);
  }

  @Post('access/:requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.photoService.rejectRequest(requestId, targetId);
  }
}
