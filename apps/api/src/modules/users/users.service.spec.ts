import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: { findOne: jest.Mock };
  let jwtService: { signAsync: jest.Mock };
  let i18nService: { translate: jest.Mock };
  let createQueryRunnerMock: jest.Mock;
  let dataSource: DataSource;
  let currentContextSpy: jest.SpyInstance;

  type CompareFn = (data: string, encrypted: string) => Promise<boolean>;
  type HashFn = (data: string, salt: number) => Promise<string>;
  const compareMock = bcrypt.compare as unknown as jest.MockedFunction<CompareFn>;
  const hashMock = bcrypt.hash as unknown as jest.MockedFunction<HashFn>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    i18nService = {
      translate: jest.fn().mockResolvedValue('translated-message'),
    };

    createQueryRunnerMock = jest.fn();
    dataSource = { createQueryRunner: createQueryRunnerMock } as unknown as DataSource;

    service = new UsersService(
      repository as unknown as Repository<User>,
      dataSource,
      i18nService as unknown as I18nService,
      jwtService as unknown as JwtService,
    );

    currentContextSpy = jest.spyOn(I18nContext, 'current').mockReturnValue(undefined);
    compareMock.mockReset();
    hashMock.mockReset();
    jwtService.signAsync.mockReset();
  });

  afterEach(() => {
    currentContextSpy.mockRestore();
  });

  describe('create', () => {
    it('hashes the password and normalizes email before persisting', async () => {
  const managerCreate = jest.fn();
  const managerSave = jest.fn();
  const managerFindOne = jest.fn();
  const managerMerge = jest.fn();
      const commitTransaction = jest.fn();
      const rollbackTransaction = jest.fn();
      const connect = jest.fn();
      const startTransaction = jest.fn();
      const release = jest.fn();
      const queryRunner = {
        manager: {
          create: managerCreate,
          save: managerSave,
          findOne: managerFindOne,
          merge: managerMerge,
        },
        connect,
        startTransaction,
        commitTransaction,
        rollbackTransaction,
        release,
      };
      createQueryRunnerMock.mockReturnValue(queryRunner);

      const hashedPassword = 'hashed-value';
      hashMock.mockResolvedValue(hashedPassword);

      const dto = {
        email: ' User@Example.COM ',
        password: 'PlainPass123!',
        displayName: 'User',
        preferencesJson: { theme: 'dark' },
      };

      const createdEntity = {
        id: 1,
        email: 'user@example.com',
        passwordHash: hashedPassword,
        displayName: dto.displayName,
        preferencesJson: dto.preferencesJson,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

      managerCreate.mockReturnValue(createdEntity);
      managerSave.mockResolvedValue(createdEntity);

      const result = await service.create(dto);

      expect(createQueryRunnerMock).toHaveBeenCalled();
      expect(connect).toHaveBeenCalled();
      expect(startTransaction).toHaveBeenCalled();
      expect(hashMock).toHaveBeenCalledWith(dto.password, 12);
      expect(managerCreate).toHaveBeenCalledWith(User, {
        email: 'user@example.com',
        passwordHash: hashedPassword,
        displayName: dto.displayName,
        preferencesJson: dto.preferencesJson,
      });
      expect(managerSave).toHaveBeenCalledWith(User, createdEntity);
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalled();
      expect(result).toBe(createdEntity);
    });
  });

  describe('update', () => {
    it('updates provided fields and re-hashes password when present', async () => {
      const existingUser: User = {
        id: 3,
        email: 'old@example.com',
        passwordHash: 'old-hash',
        displayName: 'Old',
        preferencesJson: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

  const managerCreate = jest.fn();
  const managerSave = jest.fn();
  const managerFindOne = jest.fn().mockResolvedValue(existingUser);
  const managerMerge = jest.fn((entityClass, destination, source) => {
    Object.assign(destination, source);
  });
      const commitTransaction = jest.fn();
      const rollbackTransaction = jest.fn();
      const connect = jest.fn();
      const startTransaction = jest.fn();
      const release = jest.fn();
      const queryRunner = {
        manager: {
          create: managerCreate,
          save: managerSave,
          findOne: managerFindOne,
          merge: managerMerge,
        },
        connect,
        startTransaction,
        commitTransaction,
        rollbackTransaction,
        release,
      };
      createQueryRunnerMock.mockReturnValue(queryRunner);

      const hashedPassword = 'new-hash';
      hashMock.mockResolvedValue(hashedPassword);

      const preferences = { locale: 'en' } as Record<string, unknown>;

      const resultUser: User = {
        ...existingUser,
        email: 'updated@example.com',
        passwordHash: hashedPassword,
        displayName: 'Updated',
        preferencesJson: preferences,
      };
      managerSave.mockResolvedValue(resultUser);

      const result = await service.update(3, {
        email: 'Updated@Example.com ',
        password: 'AnotherPass123!',
        displayName: 'Updated',
        preferencesJson: preferences,
      });

      expect(managerFindOne).toHaveBeenCalledWith(User, { where: { id: 3 } });
      expect(managerMerge).toHaveBeenCalledWith(User, existingUser, {
        email: 'updated@example.com',
        displayName: 'Updated',
        preferencesJson: preferences,
      });
      expect(hashMock).toHaveBeenCalledWith('AnotherPass123!', 12);
      expect(managerSave).toHaveBeenCalledWith(User, existingUser);
      expect(existingUser.email).toBe('updated@example.com');
      expect(existingUser.passwordHash).toBe(hashedPassword);
      expect(existingUser.displayName).toBe('Updated');
  expect(existingUser.preferencesJson).toEqual(preferences);
      expect(result).toBe(resultUser);
      expect(commitTransaction).toHaveBeenCalled();
      expect(rollbackTransaction).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token when credentials are valid', async () => {
      const user: User = {
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hash',
        displayName: 'User',
        preferencesJson: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

      repository.findOne.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('signed-token');

      const result = await service.login('user@example.com', 'PlainPassword1!');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(compareMock).toHaveBeenCalledWith('PlainPassword1!', user.passwordHash);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ token: 'signed-token', user });
    });

    it('throws when user is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      const loginAttempt = service.login('missing@example.com', 'any-password');

      await expect(loginAttempt).rejects.toBeInstanceOf(UnauthorizedException);

      const error = await loginAttempt.catch((err) => err);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.getResponse()).toMatchObject({ message: 'translated-message' });
      expect(compareMock).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('throws when password does not match', async () => {
      const user: User = {
        id: 2,
        email: 'user@example.com',
        passwordHash: 'hash',
        displayName: 'User',
        preferencesJson: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

      repository.findOne.mockResolvedValue(user);
      compareMock.mockResolvedValue(false);

      const loginAttempt = service.login('user@example.com', 'wrong');

      await expect(loginAttempt).rejects.toBeInstanceOf(UnauthorizedException);

      const error = await loginAttempt.catch((err) => err);
      expect(error.getResponse()).toMatchObject({ message: 'translated-message' });
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
