import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { AppConfig } from '../../../config/configuration';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly authService: AuthService,
  ) {
    const googleConfig = configService.get('google', { infer: true });

    if (!googleConfig) {
      throw new Error('Google OAuth configuration is missing');
    }

    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName } = profile;

    const user = await this.authService.validateGoogleUser({
      googleId: id,
      email: emails[0].value,
      name: displayName,
    });

    if (!user) {
      return done(new Error('Failed to authenticate with Google'), false);
    }

    done(null, user);
  }
}

