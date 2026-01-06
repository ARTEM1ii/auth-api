import { IsString, IsNumber, IsOptional, IsEnum, validateSync } from 'class-validator';
import { Type } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

type JwtConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
};

type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

export type AppConfig = {
  port: number;
  environment: Environment;
  database: DatabaseConfig;
  jwt: JwtConfig;
  google: GoogleConfig;
};

class EnvironmentVariables {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  PORT = 3000;

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Type(() => Number)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN = '7d';

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_CALLBACK_URL: string;
}

export function validate(config: Record<string, unknown>): AppConfig {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation error: ${errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ')}`,
    );
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

