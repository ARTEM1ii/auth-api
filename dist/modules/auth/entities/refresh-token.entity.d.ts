import { UserEntity } from '../../users/entities/user.entity';
export declare class RefreshTokenEntity {
    id: string;
    userId: string;
    user: UserEntity;
    tokenHash: string;
    revokedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
}
