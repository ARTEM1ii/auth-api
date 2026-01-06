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
exports.Environment = void 0;
exports.validate = validate;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var Environment;
(function (Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (exports.Environment = Environment = {}));
class EnvironmentVariables {
    PORT = 3000;
    NODE_ENV = Environment.Development;
    DB_HOST;
    DB_PORT;
    DB_USERNAME;
    DB_PASSWORD;
    DB_DATABASE;
    JWT_ACCESS_SECRET;
    JWT_REFRESH_SECRET;
    JWT_ACCESS_EXPIRES_IN = '15m';
    JWT_REFRESH_EXPIRES_IN = '7d';
    GOOGLE_CLIENT_ID;
    GOOGLE_CLIENT_SECRET;
    GOOGLE_CALLBACK_URL;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Environment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_DATABASE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "JWT_ACCESS_EXPIRES_IN", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EnvironmentVariables.prototype, "JWT_REFRESH_EXPIRES_IN", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "GOOGLE_CLIENT_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "GOOGLE_CLIENT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "GOOGLE_CALLBACK_URL", void 0);
function validate(config) {
    const validatedConfig = new EnvironmentVariables();
    Object.assign(validatedConfig, config);
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(`Configuration validation error: ${errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
    }
    return {
        port: validatedConfig.PORT,
        environment: validatedConfig.NODE_ENV,
        database: {
            host: validatedConfig.DB_HOST,
            port: validatedConfig.DB_PORT,
            username: validatedConfig.DB_USERNAME,
            password: validatedConfig.DB_PASSWORD,
            database: validatedConfig.DB_DATABASE,
        },
        jwt: {
            accessSecret: validatedConfig.JWT_ACCESS_SECRET,
            refreshSecret: validatedConfig.JWT_REFRESH_SECRET,
            accessExpiresIn: validatedConfig.JWT_ACCESS_EXPIRES_IN,
            refreshExpiresIn: validatedConfig.JWT_REFRESH_EXPIRES_IN,
        },
        google: {
            clientId: validatedConfig.GOOGLE_CLIENT_ID,
            clientSecret: validatedConfig.GOOGLE_CLIENT_SECRET,
            callbackUrl: validatedConfig.GOOGLE_CALLBACK_URL,
        },
    };
}
//# sourceMappingURL=configuration.js.map