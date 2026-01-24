import { config } from 'dotenv';
import * as path from 'path';

const testEnvPath = path.join(process.cwd(), '.env.test');
config({ path: testEnvPath });

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}
