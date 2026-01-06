export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
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
export declare function validate(config: Record<string, unknown>): AppConfig;
export {};
