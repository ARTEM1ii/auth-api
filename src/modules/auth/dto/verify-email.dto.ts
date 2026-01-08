import { IsString, Length, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

