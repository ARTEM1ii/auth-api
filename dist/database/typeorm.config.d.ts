import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
export declare const getTypeOrmConfig: (configService: ConfigService<AppConfig>) => DataSourceOptions;
export declare const getTypeOrmDataSource: (configService: ConfigService<AppConfig>) => DataSource;
