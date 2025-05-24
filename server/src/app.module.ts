import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './modules/auth/account/account.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [AccountModule, SessionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
