import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChildProfileModule } from './modules/child-profile/child-profile.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ChatModule } from './modules/chat/chat.module';
import { AdminModule } from './modules/admin/admin.module';
import { VisibilityModule } from './modules/visibility/visibility.module';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { SubscriptionCron } from './cron/subscription.cron';
import { AppEventListener } from './events/app-events.listener';
import { TrafficModule } from './modules/traffic/traffic.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PhotoModule } from './modules/photo/photo.module';
import { InterestModule } from './modules/interest/interest.module';
import { NotificationModule } from './modules/notification/notification.module';
import { BlockModule } from './modules/block/block.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,   // allow extra env vars (e.g. CI/CD injected ones)
        abortEarly: false,    // report ALL missing vars at once, not just the first
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    ChildProfileModule,
    SubscriptionModule,
    PaymentModule,
    ChatModule,
    AdminModule,
    VisibilityModule,
    RuleEngineModule,
    TrafficModule,
    CloudinaryModule,
    PhotoModule,
    InterestModule,
    NotificationModule,
    BlockModule,
  ],
  providers: [AppService, SubscriptionCron, AppEventListener],
})
export class AppModule {}
