export declare enum UserProvider {
    LOCAL = "LOCAL",
    GOOGLE = "GOOGLE"
}
export declare class UserEntity {
    id: string;
    email: string;
    passwordHash: string | null;
    provider: UserProvider;
    googleId: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
