import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileViewService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwns(userId: string, profileId: string) {
    const profile = await this.prisma.childProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException('You do not own this profile');
    return profile;
  }

  /** Record that viewerProfileId viewed targetProfileId (upsert — updates timestamp) */
  async recordView(viewerProfileId: string, targetProfileId: string) {
    if (viewerProfileId === targetProfileId) return; // don't track self-views
    try {
      await (this.prisma as any).profileView.upsert({
        where: { viewerProfileId_targetProfileId: { viewerProfileId, targetProfileId } },
        create: { id: require('crypto').randomUUID(), viewerProfileId, targetProfileId },
        update: { viewedAt: new Date() },
      });
    } catch {
      // Silently ignore if tables don't exist yet in edge cases
    }
  }

  /** Get list of profiles who viewed MY profile */
  async getWhoViewedMe(userId: string, profileId: string) {
    await this.assertOwns(userId, profileId);
    const views = await (this.prisma as any).profileView.findMany({
      where: { targetProfileId: profileId },
      include: {
        viewer: {
          select: {
            id: true, memberId: true, name: true, showRealName: true, nickname: true,
            gender: true, city: true, occupation: true,
            photos: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 50,
    });
    return { success: true, data: views };
  }

  /** Get profiles I have viewed */
  async getMyViews(userId: string, profileId: string) {
    await this.assertOwns(userId, profileId);
    const views = await (this.prisma as any).profileView.findMany({
      where: { viewerProfileId: profileId },
      include: {
        target: {
          select: {
            id: true, memberId: true, name: true, showRealName: true, nickname: true,
            gender: true, city: true, occupation: true,
            photos: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 50,
    });
    return { success: true, data: views };
  }
}
