import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { TypeOrmConfigService } from '../database/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../modules/users/users.module';
import { IngredientsModule } from '../modules/ingredients/ingredients.module';
import { RecipesModule } from '../modules/recipes/recipes.module';
import { AuthModule } from '../modules/auth/auth.module';
import { FavoritesModule } from '../modules/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'ro',
      fallbacks: {
        'ro-*': 'ro',
        'en-*': 'en',
      },
      loaderOptions: {
        path: resolveI18nPath(__dirname),
        watch: process.env.NODE_ENV !== 'production',
      },
      typesOutputPath: resolveI18nTypesPath(),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['x-lang'] },
        CookieResolver,
        AcceptLanguageResolver,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 60,
      },
    ]),
    AuthModule,
    UsersModule,
    IngredientsModule,
    RecipesModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TypeOrmConfigService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

function resolveI18nPath(currentDir: string): string {
  const candidates = [
    path.join(currentDir, '../i18n'),
    path.join(currentDir, '../../i18n'),
    path.join(currentDir, '../../../i18n'),
    path.join(process.cwd(), 'apps', 'api', 'src', 'i18n'),
    path.join(process.cwd(), 'dist', 'apps', 'api', 'i18n'),
    path.join(process.cwd(), 'apps', 'api', 'dist', 'i18n'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Default back to source path to allow nestjs-i18n to handle missing directories gracefully.
  return path.join(currentDir, '../i18n');
}

function resolveI18nTypesPath(): string {
  const envPath = process.env.I18N_TYPES_PATH;
  const candidates = [
    envPath,
    path.join(process.cwd(), 'dist', 'apps', 'api', 'generated', 'i18n-types.d.ts'),
    path.join(process.cwd(), 'tmp', 'i18n', 'i18n-types.d.ts'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const dir = path.dirname(candidate);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.accessSync(dir, fs.constants.W_OK);
      return candidate;
    } catch (error) {
      continue;
    }
  }

  const fallback = path.join(process.cwd(), 'dist', 'apps', 'api', 'i18n-types.d.ts');
  const fallbackDir = path.dirname(fallback);
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  return fallback;
}
