import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateLocalUserDto } from '../dto/create-local-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    findByGoogleId(googleId: string): Promise<UserEntity | null>;
    createLocalUser(dto: CreateLocalUserDto): Promise<UserResponseDto>;
    linkGoogleAccount(userId: string, googleId: string): Promise<UserResponseDto>;
    createGoogleUser(email: string, googleId: string): Promise<UserResponseDto>;
    private toResponseDto;
}
