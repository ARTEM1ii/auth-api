import { UserProvider } from '../entities/user.entity';

export type UserResponseDto = {
  id: string;
  email: string;
  provider: UserProvider;
  googleId: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

