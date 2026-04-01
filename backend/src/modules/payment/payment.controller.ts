import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PaymentService, InitiatePaymentDto, VerifyPaymentDto } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('initiate')
  initiate(@CurrentUser() user: any, @Body() dto: InitiatePaymentDto) {
    return this.service.initiate(user.userId, dto);
  }

  @Post('verify')
  verify(@CurrentUser() user: any, @Body() dto: VerifyPaymentDto) {
    return this.service.verifyGateway(user.userId, dto);
  }

  @Get('my')
  myPayments(@CurrentUser() user: any) {
    return this.service.getMyPayments(user.userId);
  }
}
