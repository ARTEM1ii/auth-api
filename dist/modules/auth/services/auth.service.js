"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../../users/services/users.service");
const refresh_tokens_service_1 = require("./refresh-tokens.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    refreshTokensService;
    constructor(usersService, jwtService, configService, refreshTokensService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.refreshTokensService = refreshTokensService;
    }
    async register(dto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = await this.usersService.createLocalUser({
            email: dto.email,
            password: dto.password,
        });
        const tokens = await this.generateTokens(user.id, user.email);
        const jwtConfig = this.configService.get('jwt', { infer: true });
        if (!jwtConfig) {
            throw new Error('JWT configuration is missing');
        }
        const refreshPayload = this.jwtService.decode(tokens.refreshToken);
        const expiresAt = new Date(refreshPayload.exp * 1000);
        await this.refreshTokensService.create(user.id, tokens.refreshToken, expiresAt);
        return {
            ...tokens,
            user,
        };
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user.id, user.email);
        const jwtConfig = this.configService.get('jwt', { infer: true });
        if (!jwtConfig) {
            throw new Error('JWT configuration is missing');
        }
        const refreshPayload = this.jwtService.decode(tokens.refreshToken);
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
    async refreshTokens(dto) {
        try {
            const jwtConfig = this.configService.get('jwt', { infer: true });
            if (!jwtConfig) {
                throw new Error('JWT configuration is missing');
            }
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: jwtConfig.refreshSecret,
            });
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const storedToken = await this.refreshTokensService.findValidToken(dto.refreshToken);
            if (!storedToken) {
                throw new common_1.UnauthorizedException('Refresh token not found or revoked');
            }
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            await this.refreshTokensService.revokeToken(dto.refreshToken);
            const tokens = await this.generateTokens(user.id, user.email);
            const refreshPayload = this.jwtService.decode(tokens.refreshToken);
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
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(refreshToken) {
        try {
            const jwtConfig = this.configService.get('jwt', { infer: true });
            if (!jwtConfig) {
                throw new common_1.BadRequestException('JWT configuration is missing');
            }
            this.jwtService.verify(refreshToken, {
                secret: jwtConfig.refreshSecret,
            });
            await this.refreshTokensService.revokeToken(refreshToken);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Invalid refresh token');
        }
    }
    async generateTokens(userId, email) {
        const jwtConfig = this.configService.get('jwt', { infer: true });
        if (!jwtConfig) {
            throw new Error('JWT configuration is missing');
        }
        const accessPayload = {
            sub: userId,
            email,
            type: 'access',
        };
        const refreshPayload = {
            sub: userId,
            email,
            type: 'refresh',
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: jwtConfig.accessSecret,
                expiresIn: jwtConfig.accessExpiresIn,
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: jwtConfig.refreshSecret,
                expiresIn: jwtConfig.refreshExpiresIn,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUser(userId) {
        return this.usersService.findById(userId);
    }
    async validateGoogleUser(profile) {
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
    async handleGoogleAuth(user) {
        const tokens = await this.generateTokens(user.id, user.email);
        const jwtConfig = this.configService.get('jwt', { infer: true });
        if (!jwtConfig) {
            throw new Error('JWT configuration is missing');
        }
        const refreshPayload = this.jwtService.decode(tokens.refreshToken);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        refresh_tokens_service_1.RefreshTokensService])
], AuthService);
//# sourceMappingURL=auth.service.js.map