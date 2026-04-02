import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a notification for a user */
  async create(dto: CreateNotificationDto) {
    try {
      return await (this.prisma as any).notification.create({
        data: {
          id: require('crypto').randomUUID(),
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          body: dto.body,
          link: dto.link ?? null,
        },
      });
    } catch {
      // Never throw — notifications are best-effort
    }
  }

  /** Get all notifications for a user (newest first) */
  async getAll(userId: string) {
    const items = await (this.prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unread = items.filter((n: any) => !n.isRead).length;
    return { success: true, data: items, unread };
  }

  /** Mark one notification as read */
  async markRead(id: string, userId: string) {
    await (this.prisma as any).notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true };
  }

  /** Mark ALL notifications as read */
  async markAllRead(userId: string) {
    await (this.prisma as any).notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  /** Delete a notification */
  async delete(id: string, userId: string) {
    await (this.prisma as any).notification.deleteMany({ where: { id, userId } });
    return { success: true };
  }

  /** Get unread count */
  async unreadCount(userId: string) {
    const count = await (this.prisma as any).notification.count({
      where: { userId, isRead: false },
    });
    return { success: true, count };
  }
}
