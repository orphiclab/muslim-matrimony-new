import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return { success: false, message: 'Not found', error_code: 'NOT_FOUND' };
    const { password: _, ...safe } = user;
    return { success: true, data: safe };
  }

  async updateMe(userId: string, data: { phone?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password: _, ...safe } = updated;
    return { success: true, data: safe };
  }
}
