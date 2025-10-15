import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresInRaw = configService.get<string>('JWT_EXPIRES_IN');
        const expiresIn = Number.isFinite(Number(expiresInRaw)) ? Number(expiresInRaw) : 3600;

        return {
          secret: configService.get<string>('JWT_SECRET') ?? 'change-me',
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}