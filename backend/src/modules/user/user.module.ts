import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AutoFillService } from './auto-fill.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AutoFillService],
  exports: [UserService, AutoFillService],
})
export class UserModule {}
