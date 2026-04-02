import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InterestService } from './interest.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('interest')
export class InterestController {
  constructor(private readonly service: InterestService) {}

  /** POST /interest/send  — send an interest */
  @Post('send')
  send(
    @CurrentUser() user: any,
    @Body() body: { senderProfileId: string; receiverProfileId: string; message?: string },
  ) {
    return this.service.sendInterest(user.userId, body.senderProfileId, body.receiverProfileId, body.message);
  }

  /** PATCH /interest/:id/respond  — accept or decline */
  @Patch(':id/respond')
  respond(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { receiverProfileId: string; action: 'ACCEPTED' | 'DECLINED' },
  ) {
    return this.service.respondInterest(user.userId, id, body.receiverProfileId, body.action);
  }

  /** GET /interest/:profileId/received  — my inbox */
  @Get(':profileId/received')
  received(@CurrentUser() user: any, @Param('profileId') profileId: string) {
    return this.service.getReceived(user.userId, profileId);
  }

  /** GET /interest/:profileId/sent  — my outbox */
  @Get(':profileId/sent')
  sent(@CurrentUser() user: any, @Param('profileId') profileId: string) {
    return this.service.getSent(user.userId, profileId);
  }

  /** GET /interest/:profileId/check/:targetId  — check if interest was sent */
  @Get(':profileId/check/:targetId')
  check(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.checkInterest(user.userId, profileId, targetId);
  }

  /** DELETE /interest/:profileId/withdraw/:targetId  — cancel an interest */
  @Delete(':profileId/withdraw/:targetId')
  withdraw(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.withdrawInterest(user.userId, profileId, targetId);
  }
}
