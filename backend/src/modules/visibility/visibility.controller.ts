import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsBoolean, IsString } from 'class-validator';

class ToggleVisibilityDto {
  @IsString()
  profileId: string;

  @IsBoolean()
  visible: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('visibility')
export class VisibilityController {
  constructor(private readonly service: VisibilityService) {}

  @Get('contact/:viewerProfileId/:targetProfileId')
  checkContact(
    @Param('viewerProfileId') viewerId: string,
    @Param('targetProfileId') targetId: string,
  ) {
    return this.service.checkContactVisibility(viewerId, targetId);
  }

  @Post('toggle')
  toggle(@CurrentUser() user: any, @Body() dto: ToggleVisibilityDto) {
    return this.service.toggleContactVisibility(user.userId, dto.profileId, dto.visible);
  }
}
