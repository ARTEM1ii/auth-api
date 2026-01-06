import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

export const getTypeOrmConfig = (configService: ConfigService<AppConfig>): DataSourceOptions => {
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

export const getTypeOrmDataSource = (configService: ConfigService<AppConfig>): DataSource => {
  return new DataSource(getTypeOrmConfig(configService));
};

