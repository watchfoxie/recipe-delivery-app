import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const isDevelopment = (process.env.NODE_ENV ?? 'development') !== 'production';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'root',
  database: process.env.DB_NAME ?? 'recipe_db',
  entities: [],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: isDevelopment,
});

export default dataSource;
