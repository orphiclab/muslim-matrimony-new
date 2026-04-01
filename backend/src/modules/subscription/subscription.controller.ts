import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Get('status/:childProfileId')
  getStatus(@Param('childProfileId') childProfileId: string) {
    return this.service.getStatus(childProfileId);
  }

  @Get('my')
  getMySubscriptions(@CurrentUser() user: any) {
    return this.service.getMySubscriptions(user.userId);
  }
}
