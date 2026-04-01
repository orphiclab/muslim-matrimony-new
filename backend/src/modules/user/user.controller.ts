import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsOptional, IsString } from 'class-validator';

class UpdateUserDto {
  @IsOptional() @IsString()
  phone?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.service.getMe(user.userId);
  }

  @Put('me')
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.service.updateMe(user.userId, dto);
  }
}
