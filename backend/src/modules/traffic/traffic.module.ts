import { Module } from '@nestjs/common';
import { TrafficGateway } from './traffic.gateway';

@Module({
  providers: [TrafficGateway],
  exports: [TrafficGateway],
})
export class TrafficModule {}
