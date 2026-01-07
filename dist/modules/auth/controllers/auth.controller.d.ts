import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
type CurrentUserType = {
    id: string;
    email: string;
    provider: string;
    googleId: string | null;
    isEmailVerified: boolean;
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    getMe(user: CurrentUserType): Promise<CurrentUserType>;
}
export {};
