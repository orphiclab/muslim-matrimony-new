import { Controller, Post, Delete, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { BlockService } from './block.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('block')
export class BlockController {
  constructor(private readonly service: BlockService) {}

  /** POST /block  — block a profile */
  @Post()
  block(
    @CurrentUser() user: any,
    @Body() body: { blockerProfileId: string; blockedProfileId: string },
  ) {
    return this.service.blockProfile(user.userId, body.blockerProfileId, body.blockedProfileId);
  }

  /** DELETE /block  — unblock a profile */
  @Delete()
  unblock(
    @CurrentUser() user: any,
    @Body() body: { blockerProfileId: string; blockedProfileId: string },
  ) {
    return this.service.unblockProfile(user.userId, body.blockerProfileId, body.blockedProfileId);
  }

  /** GET /block/:profileId/list  — list blocked profiles */
  @Get(':profileId/list')
  list(@CurrentUser() user: any, @Param('profileId') profileId: string) {
    return this.service.getBlockedList(user.userId, profileId);
  }

  /** GET /block/check/:blockerProfileId/:blockedProfileId */
  @Get('check/:blockerProfileId/:blockedProfileId')
  check(
    @Param('blockerProfileId') blockerProfileId: string,
    @Param('blockedProfileId') blockedProfileId: string,
  ) {
    return this.service.checkBlocked(blockerProfileId, blockedProfileId);
  }

  /** POST /block/report  — report a profile */
  @Post('report')
  report(
    @CurrentUser() user: any,
    @Body() body: { reporterProfileId: string; reportedProfileId: string; reason: string; details?: string },
  ) {
    return this.service.reportProfile(user.userId, body.reporterProfileId, body.reportedProfileId, body.reason, body.details);
  }

  /** GET /block/reports  — admin: get all reports */
  @Get('reports')
  getReports(@CurrentUser() user: any) {
    return this.service.getReports(user.userId);
  }

  /** PATCH /block/reports/:id  — admin: update report status */
  @Patch('reports/:id')
  updateReport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; adminNote?: string },
  ) {
    return this.service.updateReport(user.userId, id, body.status, body.adminNote);
  }
}
