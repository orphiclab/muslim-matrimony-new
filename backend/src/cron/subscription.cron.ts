import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SubscriptionCron {
  private readonly logger = new Logger(SubscriptionCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions() {
    const now = new Date();
    this.logger.log('Running daily subscription expiry cron...');

    // Find all ACTIVE subscriptions past their end date
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now },
      },
      include: { childProfile: true },
    });

    this.logger.log(`Found ${expired.length} subscriptions to expire`);

    for (const sub of expired) {
      await this.prisma.$transaction(async (tx) => {
        // Expire subscription
        await tx.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        // Hide profile
        await tx.childProfile.update({
          where: { id: sub.childProfileId },
          data: { status: 'EXPIRED' },
        });
      });

      // Emit event
      this.events.emit('SUBSCRIPTION_EXPIRED', {
        subscriptionId: sub.id,
        profileId: sub.childProfileId,
        userId: sub.childProfile.userId,
      });

      this.logger.log(`EXPIRED: subscription=${sub.id} profile=${sub.childProfileId}`);
    }

    this.logger.log('Subscription expiry cron complete.');
  }
}
