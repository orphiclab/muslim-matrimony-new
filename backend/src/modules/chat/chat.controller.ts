import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post('send')
  send(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.service.send(user.userId, dto);
  }

  @Get('history/:myProfileId/:otherProfileId')
  history(@Param('myProfileId') myId: string, @Param('otherProfileId') otherId: string) {
    return this.service.getHistory(myId, otherId);
  }

  @Get('conversations/:profileId')
  conversations(@Param('profileId') profileId: string) {
    return this.service.getConversations(profileId);
  }
}
