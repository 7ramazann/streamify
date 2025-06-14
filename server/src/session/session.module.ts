import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { RedisService } from '@/core/redis/redis.service';
import { RedisModule } from '@/core/redis/redis.module';

@Module({
  providers: [SessionResolver, SessionService],
  imports: [RedisModule]
})
export class SessionModule {}
