import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('profile')
export class ProfileListController {
  constructor(private readonly service: ProfileListService) {}

  // GET /api/profile/list/:viewerProfileId  (requires auth)
  @UseGuards(JwtAuthGuard)
  @Get('list/:viewerProfileId')
  getList(@Param('viewerProfileId') viewerProfileId: string) {
    return this.service.getVisibleProfiles(viewerProfileId);
  }

  // GET /api/profile/public/:id  (NO auth — public detail page + analytics)
  @Get('public/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.service.getPublicProfile(id);
  }
}
