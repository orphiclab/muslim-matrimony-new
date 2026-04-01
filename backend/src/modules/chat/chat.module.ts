import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';

@Module({
  imports: [
    RuleEngineModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'default_secret',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
