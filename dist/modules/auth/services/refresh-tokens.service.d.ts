import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AppConfig } from '../../../config/configuration';
export declare class RefreshTokensService {
    private readonly refreshTokenRepository;
    private readonly configService;
    constructor(refreshTokenRepository: Repository<RefreshTokenEntity>, configService: ConfigService<AppConfig>);
    private hashToken;
    create(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenEntity>;
    findValidToken(token: string): Promise<RefreshTokenEntity | null>;
    revokeToken(token: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
}
