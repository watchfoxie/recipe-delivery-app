import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'ro',
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
    UsersModule,
    IngredientsModule,
    RecipesModule,
  ],
  controllers: [AppController],
  providers: [AppService, TypeOrmConfigService],
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
  const candidates = [
    path.join(process.cwd(), 'apps', 'api', 'src', 'i18n-types.d.ts'),
    path.join(process.cwd(), 'apps', 'api', 'i18n-types.d.ts'),
    path.join(__dirname, '../i18n-types.d.ts'),
  ];

  for (const candidate of candidates) {
    const dir = path.dirname(candidate);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return candidate;
  }

  return path.join(process.cwd(), 'apps', 'api', 'src', 'i18n-types.d.ts');
}
