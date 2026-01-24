import { Injectable } from '@nestjs/common';
import {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import * as path from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isDevelopment = (process.env.NODE_ENV ?? 'development') !== 'production';

    return {
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'root',
      database: process.env.DB_NAME ?? 'recipe_db',
      autoLoadEntities: true,
      synchronize: false,
      logging: isDevelopment,
      manualInitialization: true,
      migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
      migrationsTableName: 'migrations',
    };
  }
}
