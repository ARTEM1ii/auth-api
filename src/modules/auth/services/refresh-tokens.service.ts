import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AppConfig } from '../../../config/configuration';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  private hashToken(token: string): string {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    const pepper = jwtConfig?.refreshSecret || 'default-pepper';
    return createHash('sha256').update(token + pepper).digest('hex');
  }

  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    const tokenHash = this.hashToken(token);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async findValidToken(token: string): Promise<RefreshTokenEntity | null> {
    const tokenHash = this.hashToken(token);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    return refreshToken;
  }

  async revokeToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await this.refreshTokenRepository.update(
      {
        tokenHash,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      {
        userId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}

