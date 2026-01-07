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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let RefreshTokenEntity = class RefreshTokenEntity {
    id;
    userId;
    user;
    tokenHash;
    revokedAt;
    expiresAt;
    createdAt;
};
exports.RefreshTokenEntity = RefreshTokenEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RefreshTokenEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], RefreshTokenEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], RefreshTokenEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'token_hash' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], RefreshTokenEntity.prototype, "tokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'revoked_at', nullable: true }),
    __metadata("design:type", Object)
], RefreshTokenEntity.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'expires_at' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], RefreshTokenEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RefreshTokenEntity.prototype, "createdAt", void 0);
exports.RefreshTokenEntity = RefreshTokenEntity = __decorate([
    (0, typeorm_1.Entity)('refresh_tokens')
], RefreshTokenEntity);
//# sourceMappingURL=refresh-token.entity.js.map