import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const mailConfig = configService.get('mail', { infer: true });

        if (!mailConfig) {
          throw new Error('Mail configuration is missing');
        }

        return {
          transport: {
            host: mailConfig.host,
            port: mailConfig.port,
            secure: mailConfig.secure,
            auth: {
              user: mailConfig.user,
              pass: mailConfig.password,
            },
          },
          defaults: {
            from: mailConfig.from,
          },
        };
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}

