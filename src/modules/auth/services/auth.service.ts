import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AppConfig } from '../../../config/configuration';
import { TokenPayload } from '../types/jwt-payload.type';
import { RefreshTokensService } from './refresh-tokens.service';
import { EmailVerificationService } from './email-verification.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersService.createLocalUser({
      email: dto.email,
      password: dto.password,
    });

    await this.emailVerificationService.createAndSendCode(user.id, user.email);

    const tokens = await this.generateTokens(user.id, user.email);

    const jwtConfig = this.configService.get('jwt', { infer: true });
    if (!jwtConfig) {
      throw new Error('JWT configuration is missing');
    }

    const refreshPayload = this.jwtService.decode(tokens.refreshToken) as TokenPayload & { exp: number };
    const expiresAt = new Date(refreshPayload.exp * 1000);

    await this.refreshTokensService.create(user.id, tokens.refreshToken, expiresAt);

    return {
      ...tokens,
      user,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const jwtConfig = this.configService.get('jwt', { infer: true });
    if (!jwtConfig) {
      throw new Error('JWT configuration is missing');
    }

    const refreshPayload = this.jwtService.decode(tokens.refreshToken) as TokenPayload & { exp: number };
    const expiresAt = new Date(refreshPayload.exp * 1000);

    await this.refreshTokensService.create(user.id, tokens.refreshToken, expiresAt);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider,
        googleId: user.googleId,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const jwtConfig = this.configService.get('jwt', { infer: true });

      if (!jwtConfig) {
        throw new Error('JWT configuration is missing');
      }

      const payload = this.jwtService.verify<TokenPayload>(dto.refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const storedToken = await this.refreshTokensService.findValidToken(dto.refreshToken);

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found or revoked');
      }

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.refreshTokensService.revokeToken(dto.refreshToken);

      const tokens = await this.generateTokens(user.id, user.email);

      const refreshPayload = this.jwtService.decode(tokens.refreshToken) as TokenPayload & { exp: number };
      const expiresAt = new Date(refreshPayload.exp * 1000);

      await this.refreshTokensService.create(user.id, tokens.refreshToken, expiresAt);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          provider: user.provider,
          googleId: user.googleId,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const jwtConfig = this.configService.get('jwt', { infer: true });

      if (!jwtConfig) {
        throw new BadRequestException('JWT configuration is missing');
      }

      this.jwtService.verify(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      await this.refreshTokensService.revokeToken(refreshToken);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    if (!jwtConfig) {
      throw new Error('JWT configuration is missing');
    }

    const accessPayload: TokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: jwtConfig.accessSecret,
        expiresIn: jwtConfig.accessExpiresIn,
      } as any),
      this.jwtService.signAsync(refreshPayload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn,
      } as any),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
  }) {
    const existingGoogleUser = await this.usersService.findByGoogleId(profile.googleId);

    if (existingGoogleUser) {
      return existingGoogleUser;
    }

    const existingEmailUser = await this.usersService.findByEmail(profile.email);

    if (existingEmailUser) {
      const linkedUser = await this.usersService.linkGoogleAccount(existingEmailUser.id, profile.googleId);
      const fullUser = await this.usersService.findById(linkedUser.id);
      return fullUser;
    }

    const newUserDto = await this.usersService.createGoogleUser(profile.email, profile.googleId);
    const newUser = await this.usersService.findById(newUserDto.id);
    return newUser;
  }

  async handleGoogleAuth(user: {
    id: string;
    email: string;
    provider: string;
    googleId: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<AuthResponseDto> {
    const tokens = await this.generateTokens(user.id, user.email);

    const jwtConfig = this.configService.get('jwt', { infer: true });
    if (!jwtConfig) {
      throw new Error('JWT configuration is missing');
    }

    const refreshPayload = this.jwtService.decode(tokens.refreshToken) as TokenPayload & { exp: number };
    const expiresAt = new Date(refreshPayload.exp * 1000);

    await this.refreshTokensService.create(user.id, tokens.refreshToken, expiresAt);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider as any,
        googleId: user.googleId,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    await this.emailVerificationService.verifyCode(dto.userId, dto.code);

    const user = await this.usersService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    await this.usersService.updateUser(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCode(dto: ResendVerificationDto): Promise<{ message: string }> {
    const user = await this.usersService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.emailVerificationService.createAndSendCode(user.id, user.email);

    return { message: 'Verification code sent successfully' };
  }
}

