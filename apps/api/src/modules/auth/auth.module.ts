import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
