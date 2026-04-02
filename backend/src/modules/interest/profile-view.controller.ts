import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProfileViewService } from './profile-view.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profile-views')
export class ProfileViewController {
  constructor(private readonly service: ProfileViewService) {}

  /** POST /profile-views/record  — record a view */
  @Post('record')
  record(@Body() body: { viewerProfileId: string; targetProfileId: string }) {
    return this.service.recordView(body.viewerProfileId, body.targetProfileId).then(() => ({ success: true }));
  }

  /** GET /profile-views/:profileId/viewers  — who viewed MY profile */
  @Get(':profileId/viewers')
  viewers(@CurrentUser() user: any, @Param('profileId') profileId: string) {
    return this.service.getWhoViewedMe(user.userId, profileId);
  }

  /** GET /profile-views/:profileId/visited  — profiles I visited */
  @Get(':profileId/visited')
  visited(@CurrentUser() user: any, @Param('profileId') profileId: string) {
    return this.service.getMyViews(user.userId, profileId);
  }
}
