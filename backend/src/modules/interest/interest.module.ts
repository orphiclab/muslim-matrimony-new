import { Module } from '@nestjs/common';
import { InterestController } from './interest.controller';
import { InterestService } from './interest.service';
import { ProfileViewController } from './profile-view.controller';
import { ProfileViewService } from './profile-view.service';

@Module({
  controllers: [InterestController, ProfileViewController],
  providers: [InterestService, ProfileViewService],
  exports: [ProfileViewService],
})
export class InterestModule {}
