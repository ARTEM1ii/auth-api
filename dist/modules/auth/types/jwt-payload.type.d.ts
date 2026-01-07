export type TokenPayload = {
    sub: string;
    email: string;
    type: 'access' | 'refresh';
};
