import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserProvider } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateLocalUserDto } from '../dto/create-local-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async createLocalUser(dto: CreateLocalUserDto): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      provider: UserProvider.LOCAL,
      googleId: null,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    return this.toResponseDto(savedUser);
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<UserResponseDto> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.googleId = googleId;

    const updatedUser = await this.userRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  async createGoogleUser(email: string, googleId: string): Promise<UserResponseDto> {
    const user = this.userRepository.create({
      email,
      passwordHash: null,
      provider: UserProvider.GOOGLE,
      googleId,
      isEmailVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    return this.toResponseDto(savedUser);
  }

  async updateUser(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }

  private toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      provider: user.provider,
      googleId: user.googleId,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

