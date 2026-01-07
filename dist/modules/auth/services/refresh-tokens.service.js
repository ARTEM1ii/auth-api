"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokensService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const refresh_token_entity_1 = require("../entities/refresh-token.entity");
let RefreshTokensService = class RefreshTokensService {
    refreshTokenRepository;
    configService;
    constructor(refreshTokenRepository, configService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.configService = configService;
    }
    hashToken(token) {
        const jwtConfig = this.configService.get('jwt', { infer: true });
        const pepper = jwtConfig?.refreshSecret || 'default-pepper';
        return (0, crypto_1.createHash)('sha256').update(token + pepper).digest('hex');
    }
    async create(userId, token, expiresAt) {
        const tokenHash = this.hashToken(token);
        const refreshToken = this.refreshTokenRepository.create({
            userId,
            tokenHash,
            expiresAt,
            revokedAt: null,
        });
        return this.refreshTokenRepository.save(refreshToken);
    }
    async findValidToken(token) {
        const tokenHash = this.hashToken(token);
        const refreshToken = await this.refreshTokenRepository.findOne({
            where: {
                tokenHash,
                revokedAt: (0, typeorm_2.IsNull)(),
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            relations: ['user'],
        });
        return refreshToken;
    }
    async revokeToken(token) {
        const tokenHash = this.hashToken(token);
        await this.refreshTokenRepository.update({
            tokenHash,
            revokedAt: (0, typeorm_2.IsNull)(),
        }, {
            revokedAt: new Date(),
        });
    }
    async revokeAllUserTokens(userId) {
        await this.refreshTokenRepository.update({
            userId,
            revokedAt: (0, typeorm_2.IsNull)(),
        }, {
            revokedAt: new Date(),
        });
    }
    async cleanupExpiredTokens() {
        await this.refreshTokenRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
    }
};
exports.RefreshTokensService = RefreshTokensService;
exports.RefreshTokensService = RefreshTokensService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshTokenEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], RefreshTokensService);
//# sourceMappingURL=refresh-tokens.service.js.map