import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BlockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notif: NotificationService,
  ) {}

  private async assertOwns(userId: string, profileId: string) {
    const p = await this.prisma.childProfile.findUnique({ where: { id: profileId } });
    if (!p) throw new NotFoundException('Profile not found');
    if (p.userId !== userId) throw new ForbiddenException('You do not own this profile');
    return p;
  }

  // ─── Block ──────────────────────────────────────────────────────────────

  async blockProfile(userId: string, blockerProfileId: string, blockedProfileId: string) {
    await this.assertOwns(userId, blockerProfileId);
    if (blockerProfileId === blockedProfileId) throw new BadRequestException('Cannot block yourself');

    const existing = await (this.prisma as any).blockedProfile.findUnique({
      where: { blockerProfileId_blockedProfileId: { blockerProfileId, blockedProfileId } },
    });
    if (existing) throw new ConflictException('Already blocked');

    await (this.prisma as any).blockedProfile.create({
      data: { id: require('crypto').randomUUID(), blockerProfileId, blockedProfileId },
    });
    return { success: true, message: 'Profile blocked' };
  }

  async unblockProfile(userId: string, blockerProfileId: string, blockedProfileId: string) {
    await this.assertOwns(userId, blockerProfileId);
    await (this.prisma as any).blockedProfile.deleteMany({
      where: { blockerProfileId, blockedProfileId },
    });
    return { success: true, message: 'Profile unblocked' };
  }

  async getBlockedList(userId: string, profileId: string) {
    await this.assertOwns(userId, profileId);
    const items = await (this.prisma as any).blockedProfile.findMany({
      where: { blockerProfileId: profileId },
      include: {
        blocked: {
          select: { id: true, memberId: true, name: true, gender: true, city: true,
            photos: { where: { isPrimary: true }, take: 1, select: { url: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  async checkBlocked(blockerProfileId: string, blockedProfileId: string) {
    const item = await (this.prisma as any).blockedProfile.findUnique({
      where: { blockerProfileId_blockedProfileId: { blockerProfileId, blockedProfileId } },
    });
    return { success: true, isBlocked: !!item };
  }

  // ─── Report ─────────────────────────────────────────────────────────────

  async reportProfile(
    userId: string,
    reporterProfileId: string,
    reportedProfileId: string,
    reason: string,
    details?: string,
  ) {
    const reporter = await this.assertOwns(userId, reporterProfileId);
    if (reporterProfileId === reportedProfileId) throw new BadRequestException('Cannot report yourself');

    const reported = await this.prisma.childProfile.findUnique({ where: { id: reportedProfileId } });
    if (!reported) throw new NotFoundException('Reported profile not found');

    const report = await (this.prisma as any).report.create({
      data: {
        id: require('crypto').randomUUID(),
        reporterProfileId,
        reportedProfileId,
        reason,
        details: details ?? null,
        status: 'PENDING',
      },
    });

    // Notify admin via notification on admin user? We skip for now (admin can see in dashboard)

    return { success: true, message: 'Report submitted. Our team will review it.', data: report };
  }

  async getReports(userId: string) {
    // Admin only — returns all reports
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Admin only');

    const items = await (this.prisma as any).report.findMany({
      include: {
        reporter: { select: { id: true, memberId: true, name: true } },
        reported: { select: { id: true, memberId: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  async updateReport(adminUserId: string, reportId: string, status: string, adminNote?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Admin only');

    const updated = await (this.prisma as any).report.update({
      where: { id: reportId },
      data: { status, adminNote: adminNote ?? null, updatedAt: new Date() },
    });
    return { success: true, data: updated };
  }
}
