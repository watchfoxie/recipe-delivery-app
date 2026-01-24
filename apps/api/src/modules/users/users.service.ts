import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserTheme } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly passwordSaltRounds = 12;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const passwordHash = await this.hashPassword(dto.password);
      const entity = manager.create(User, {
        email: this.normalizeEmail(dto.email),
        passwordHash,
        displayName: dto.displayName,
        preferencesJson: dto.preferencesJson ?? null,
      });

      try {
        return await manager.save(User, entity);
      } catch (error) {
        await this.handleUniqueConstraint(error, 'messages.ERROR.USER_EMAIL_EXISTS');
        throw error;
      }
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(User, { where: { id } });
      if (!existing) {
        throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
      }

      const { password, ...rest } = dto;
      const normalizedPayload: Partial<User> = {};

      if (rest.email !== undefined) {
        normalizedPayload.email = this.normalizeEmail(rest.email);
      }

      if (rest.displayName !== undefined) {
        normalizedPayload.displayName = rest.displayName;
      }

      if (rest.preferencesJson !== undefined) {
        normalizedPayload.preferencesJson = rest.preferencesJson ?? null;
      }

      manager.merge(User, existing, normalizedPayload);

      if (password !== undefined) {
        existing.passwordHash = await this.hashPassword(password);
      }

      try {
        return await manager.save(User, existing);
      } catch (error) {
        await this.handleUniqueConstraint(error, 'messages.ERROR.USER_EMAIL_EXISTS');
        throw error;
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(User, { where: { id } });
      if (!existing) {
        throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
      }

      await manager.softRemove(User, existing);
    });
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.usersRepository.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      this.logger.warn(`Failed login attempt for unknown account: ${normalizedEmail}`);
      throw new UnauthorizedException(await this.translate('auth.ERROR.LOGIN_FAILED'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for account: ${normalizedEmail}`);
      throw new UnauthorizedException(await this.translate('auth.ERROR.LOGIN_FAILED'));
    }

    const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });

    this.logger.log(`User ${normalizedEmail} authenticated successfully`);

    return { token, user };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(User, { where: { id: userId } });
      if (!existing) {
        throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
      }

      if (dto.email !== undefined) {
        existing.email = this.normalizeEmail(dto.email);
      }

      if (dto.displayName !== undefined) {
        existing.displayName = dto.displayName;
      }

      if (dto.avatar !== undefined) {
        existing.avatar = dto.avatar || null;
      }

      try {
        return await manager.save(User, existing);
      } catch (error) {
        await this.handleUniqueConstraint(error, 'messages.ERROR.USER_EMAIL_EXISTS');
        throw error;
      }
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException(await this.translate('auth.ERROR.INVALID_CURRENT_PASSWORD'));
    }

    user.passwordHash = await this.hashPassword(dto.newPassword);
    await this.usersRepository.save(user);
  }

  async updateTheme(userId: number, theme: UserTheme): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
    }

    user.theme = theme;
    return this.usersRepository.save(user);
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(await this.translate('messages.ERROR.USER_NOT_FOUND'));
    }
    return user;
  }

  private async executeInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleUniqueConstraint(error: unknown, messageKey: string) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(await this.translate(messageKey));
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.passwordSaltRounds);
  }

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}