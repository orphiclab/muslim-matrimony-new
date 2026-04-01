import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AppEventListener {
  private readonly logger = new Logger('EventSystem');

  @OnEvent('PROFILE_CREATED')
  onProfileCreated(payload: any) {
    this.logger.log(`[EVENT] PROFILE_CREATED: profileId=${payload.profileId} userId=${payload.userId}`);
    // TODO: send welcome notification
  }

  @OnEvent('PAYMENT_SUCCESS')
  onPaymentSuccess(payload: any) {
    this.logger.log(`[EVENT] PAYMENT_SUCCESS: paymentId=${payload.paymentId} profileId=${payload.profileId}`);
    // TODO: send payment confirmation email
  }

  @OnEvent('PAYMENT_PENDING')
  onPaymentPending(payload: any) {
    this.logger.log(`[EVENT] PAYMENT_PENDING (bank transfer): paymentId=${payload.paymentId}`);
    // TODO: notify admin of pending bank transfer
  }

  @OnEvent('PROFILE_ACTIVATED')
  onProfileActivated(payload: any) {
    this.logger.log(`[EVENT] PROFILE_ACTIVATED: profileId=${payload.profileId}`);
    // TODO: send activation notification to user
  }

  @OnEvent('SUBSCRIPTION_EXPIRED')
  onSubscriptionExpired(payload: any) {
    this.logger.log(
      `[EVENT] SUBSCRIPTION_EXPIRED: subscriptionId=${payload.subscriptionId} profileId=${payload.profileId}`,
    );
    // TODO: send renewal reminder email
  }

  @OnEvent('MESSAGE_SENT')
  onMessageSent(payload: any) {
    this.logger.log(`[EVENT] MESSAGE_SENT: id=${payload.messageId} sender=${payload.sender} → receiver=${payload.receiver}`);
    // TODO: send push notification to receiver
  }
}
