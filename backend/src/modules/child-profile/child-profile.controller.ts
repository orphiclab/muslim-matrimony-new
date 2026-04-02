import { Controller, Post, Get, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ChildProfileService } from './child-profile.service';
import { CreateChildProfileDto, UpdateChildProfileDto } from './dto/child-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ChildProfileController {
  constructor(private readonly service: ChildProfileService) {}

  @Post('create')
  create(@CurrentUser() user: any, @Body() dto: CreateChildProfileDto) {
    return this.service.create(user.userId, dto);
  }

  @Put('update/:id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateChildProfileDto) {
    return this.service.update(user.userId, id, dto);
  }

  @Patch('privacy/:id')
  updatePrivacy(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { showRealName?: boolean; nickname?: string },
  ) {
    return this.service.updatePrivacy(user.userId, id, body);
  }

  @Post('boost/:id')
  boostProfile(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { days: number },
  ) {
    return this.service.boostProfile(user.userId, id, body.days);
  }

  @Get('my')
  getMyProfiles(@CurrentUser() user: any) {
    return this.service.getMyProfiles(user.userId);
  }

  @Post(':id/shortlist/:targetId')
  toggleShortlist(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.toggleShortlist(user.userId, id, targetId);
  }

  @Get(':id/shortlists')
  getShortlists(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.service.getShortlists(user.userId, id);
  }

  @Get(':id/recommendations')
  getRecommendations(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.service.getRecommendations(user.userId, id);
  }

  @Patch(':id/verify')
  verifyProfile(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean,
  ) {
    return this.service.verifyProfile(user.userId, id, isVerified ?? true);
  }

  @Get(':id')
  getOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getOne(user.userId, id);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.delete(user.userId, id);
  }
}
