import { UserResponseDto } from '../../users/dto/user-response.dto';

export type AuthResponseDto = {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
};

