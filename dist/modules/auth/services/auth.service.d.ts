import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AppConfig } from '../../../config/configuration';
import { RefreshTokensService } from './refresh-tokens.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly refreshTokensService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService<AppConfig>, refreshTokensService: RefreshTokensService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(refreshToken: string): Promise<void>;
    private generateTokens;
    validateUser(userId: string): Promise<import("../../users/entities").UserEntity | null>;
    validateGoogleUser(profile: {
        googleId: string;
        email: string;
        name: string;
    }): Promise<import("../../users/entities").UserEntity | null>;
    handleGoogleAuth(user: {
        id: string;
        email: string;
        provider: string;
        googleId: string | null;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<AuthResponseDto>;
}
