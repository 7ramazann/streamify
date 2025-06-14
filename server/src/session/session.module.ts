import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { RedisService } from '@/core/redis/redis.service';
import { RedisModule } from '@/core/redis/redis.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMailerConfig } from '@/core/config/mailer.config';

@Module({
  providers: [SessionResolver, SessionService],
  imports: [RedisModule, MailerModule,
    ConfigModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getMailerConfig,
    }),
  ],
  exports: [MailerModule],
})
export class SessionModule {}
