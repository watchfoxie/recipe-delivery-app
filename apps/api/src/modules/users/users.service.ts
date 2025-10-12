import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const entity = manager.create(User, dto);

      try {
        return await manager.save(User, entity);
      } catch (error) {
        await this.handleUniqueConstraint(error, 'messages.USERS.ERROR.EMAIL_EXISTS');
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
      throw new NotFoundException(await this.translate('messages.USERS.ERROR.NOT_FOUND'));
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    return this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(User, { where: { id } });
      if (!existing) {
        throw new NotFoundException(await this.translate('messages.USERS.ERROR.NOT_FOUND'));
      }

      manager.merge(User, existing, dto);

      try {
        return await manager.save(User, existing);
      } catch (error) {
        await this.handleUniqueConstraint(error, 'messages.USERS.ERROR.EMAIL_EXISTS');
        throw error;
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.executeInTransaction(async (manager) => {
      const existing = await manager.findOne(User, { where: { id } });
      if (!existing) {
        throw new NotFoundException(await this.translate('messages.USERS.ERROR.NOT_FOUND'));
      }

      await manager.softRemove(User, existing);
    });
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

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}