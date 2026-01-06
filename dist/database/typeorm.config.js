"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmDataSource = exports.getTypeOrmConfig = void 0;
const typeorm_1 = require("typeorm");
const getTypeOrmConfig = (configService) => {
    const dbConfig = configService.get('database', { infer: true });
    if (!dbConfig) {
        throw new Error('Database configuration is missing');
    }
    return {
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    };
};
exports.getTypeOrmConfig = getTypeOrmConfig;
const getTypeOrmDataSource = (configService) => {
    return new typeorm_1.DataSource((0, exports.getTypeOrmConfig)(configService));
};
exports.getTypeOrmDataSource = getTypeOrmDataSource;
//# sourceMappingURL=typeorm.config.js.map