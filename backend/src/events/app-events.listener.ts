import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../modules/notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppEventListener {
  private readonly logger = new Logger('EventSystem');

  constructor(
    private readonly notif: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('PROFILE_CREATED')
  onProfileCreated(payload: any) {
    this.logger.log(`[EVENT] PROFILE_CREATED: profileId=${payload.profileId} userId=${payload.userId}`);
    this.notif.create({
      userId: payload.userId,
      type: 'PROFILE_CREATED',
      title: 'Profile Created',
      body: 'Your profile has been created. Complete it to attract the best matches!',
      link: '/dashboard/profiles',
    });
  }

  @OnEvent('PAYMENT_SUCCESS')
  async onPaymentSuccess(payload: any) {
    this.logger.log(`[EVENT] PAYMENT_SUCCESS: paymentId=${payload.paymentId} profileId=${payload.profileId}`);
    const profile = await this.prisma.childProfile.findUnique({ where: { id: payload.profileId } });
    if (profile) {
      this.notif.create({
        userId: profile.userId,
        type: 'PAYMENT_SUCCESS',
        title: '✅ Payment Confirmed',
        body: 'Your payment was successful. Your subscription is now active!',
        link: '/dashboard/subscription',
      });
    }
  }

  @OnEvent('PAYMENT_PENDING')
  onPaymentPending(payload: any) {
    this.logger.log(`[EVENT] PAYMENT_PENDING (bank transfer): paymentId=${payload.paymentId}`);
  }

  @OnEvent('PROFILE_ACTIVATED')
  async onProfileActivated(payload: any) {
    this.logger.log(`[EVENT] PROFILE_ACTIVATED: profileId=${payload.profileId}`);
    const profile = await this.prisma.childProfile.findUnique({ where: { id: payload.profileId } });
    if (profile) {
      this.notif.create({
        userId: profile.userId,
        type: 'PROFILE_ACTIVATED',
        title: '🎉 Profile is Live!',
        body: 'Your profile is now active and visible to other members.',
        link: '/dashboard/parent',
      });
    }
  }

  @OnEvent('SUBSCRIPTION_EXPIRED')
  async onSubscriptionExpired(payload: any) {
    this.logger.log(`[EVENT] SUBSCRIPTION_EXPIRED: subscriptionId=${payload.subscriptionId} profileId=${payload.profileId}`);
    const profile = await this.prisma.childProfile.findUnique({ where: { id: payload.profileId } });
    if (profile) {
      this.notif.create({
        userId: profile.userId,
        type: 'SUBSCRIPTION_EXPIRED',
        title: '⚠️ Subscription Expired',
        body: 'Your subscription has expired. Renew now to stay visible to other members.',
        link: '/select-plan',
      });
    }
  }

  @OnEvent('MESSAGE_SENT')
  async onMessageSent(payload: any) {
    this.logger.log(`[EVENT] MESSAGE_SENT: id=${payload.messageId} sender=${payload.sender} → receiver=${payload.receiver}`);
    try {
      const receiverProfile = await this.prisma.childProfile.findUnique({ where: { id: payload.receiver } });
      if (receiverProfile) {
        this.notif.create({
          userId: receiverProfile.userId,
          type: 'MESSAGE',
          title: '💬 New Message',
          body: `You have a new message from ${payload.senderName ?? 'a member'}.`,
          link: '/dashboard/chat',
        });
      }
    } catch { /* silent */ }
  }

  @OnEvent('INTEREST_SENT')
  async onInterestSent(payload: any) {
    this.logger.log(`[EVENT] INTEREST_SENT: from=${payload.senderProfileId} to=${payload.receiverProfileId}`);
    try {
      const receiverProfile = await this.prisma.childProfile.findUnique({ where: { id: payload.receiverProfileId } });
      if (receiverProfile) {
        this.notif.create({
          userId: receiverProfile.userId,
          type: 'INTEREST_RECEIVED',
          title: '💌 New Interest!',
          body: `${payload.senderName ?? 'A member'} has expressed interest in your profile.`,
          link: '/dashboard/interests',
        });
      }
    } catch { /* silent */ }
  }

  @OnEvent('INTEREST_ACCEPTED')
  async onInterestAccepted(payload: any) {
    this.logger.log(`[EVENT] INTEREST_ACCEPTED: from=${payload.receiverProfileId} to=${payload.senderProfileId}`);
    try {
      const senderProfile = await this.prisma.childProfile.findUnique({ where: { id: payload.senderProfileId } });
      if (senderProfile) {
        this.notif.create({
          userId: senderProfile.userId,
          type: 'INTEREST_ACCEPTED',
          title: '✅ Interest Accepted!',
          body: `${payload.receiverName ?? 'A member'} has accepted your interest.`,
          link: '/dashboard/interests',
        });
      }
    } catch { /* silent */ }
  }

  @OnEvent('PHOTO_REQUEST')
  async onPhotoRequest(payload: any) {
    this.logger.log(`[EVENT] PHOTO_REQUEST: from=${payload.requesterProfileId} to=${payload.targetProfileId}`);
    try {
      const targetProfile = await this.prisma.childProfile.findUnique({ where: { id: payload.targetProfileId } });
      if (targetProfile) {
        this.notif.create({
          userId: targetProfile.userId,
          type: 'PHOTO_REQUEST',
          title: '📷 Photo Access Request',
          body: `${payload.requesterName ?? 'A member'} has requested access to your photos.`,
          link: '/dashboard/parent',
        });
      }
    } catch { /* silent */ }
  }
}
