import { MailerOptions } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

export function getMailerConfig(configService: ConfigService): MailerOptions {
    return {
      transport: {
        host: configService.getOrThrow<string>('MAIL_HOST'),
        port: parseInt(configService.getOrThrow<string>('MAIL_PORT'), 10),
        secure: true,
        auth: {
          user: configService.getOrThrow<string>('MAIL_LOGIN'),
          pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"Steamify" <${configService.getOrThrow<string>('MAIL_LOGIN')}>`
      }
    }
  }