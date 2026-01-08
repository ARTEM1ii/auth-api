import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { EmailVerificationEntity } from '../entities/email-verification.entity';
import { MailService } from './mail.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepository: Repository<EmailVerificationEntity>,
    private readonly mailService: MailService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
  }

  async createAndSendCode(userId: string, email: string): Promise<string> {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .andWhere('is_used = false')
      .andWhere('expires_at < :now', { now: new Date() })
      .execute();

    const verification = this.emailVerificationRepository.create({
      userId,
      code,
      expiresAt,
      isUsed: false,
    });

    await this.emailVerificationRepository.save(verification);

    await this.mailService.sendVerificationCode(email, code);

    return code;
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: {
        userId,
        code,
        isUsed: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!verification) {
      throw new NotFoundException('Invalid verification code');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    if (verification.isUsed) {
      throw new BadRequestException('Verification code has already been used');
    }

    verification.isUsed = true;
    await this.emailVerificationRepository.save(verification);

    return true;
  }

  async cleanupExpiredCodes(): Promise<void> {
    await this.emailVerificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}

