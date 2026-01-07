import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { RefreshTokensService } from './services/refresh-tokens.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const jwtConfig = configService.get('jwt', { infer: true });

        if (!jwtConfig) {
          throw new Error('JWT configuration is missing');
        }

        return {
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: jwtConfig.accessExpiresIn,
          } as any,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}

