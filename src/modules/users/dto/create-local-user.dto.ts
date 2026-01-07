import { IsEmail, IsString, MinLength } from 'class-validator';

export type CreateLocalUserDto = {
  email: string;
  password: string;
};

export class CreateLocalUserValidationDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

