import { Controller, Get, Delete, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /** GET /notifications  — all notifications for the logged-in user */
  @Get()
  getAll(@CurrentUser() user: any) {
    return this.service.getAll(user.userId);
  }

  /** GET /notifications/unread-count */
  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.service.unreadCount(user.userId);
  }

  /** PATCH /notifications/:id/read */
  @Patch(':id/read')
  markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.markRead(id, user.userId);
  }

  /** PATCH /notifications/read-all */
  @Patch('read-all')
  markAllRead(@CurrentUser() user: any) {
    return this.service.markAllRead(user.userId);
  }

  /** DELETE /notifications/:id */
  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.delete(id, user.userId);
  }
}
