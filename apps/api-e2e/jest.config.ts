/* eslint-disable */
import { readFileSync } from 'fs';
import { join } from 'path';

// Citirea configurației de compilare SWC pentru fișierele de test (spec)
const swcJestConfig = JSON.parse(
  readFileSync(join(process.cwd(), 'apps', 'api-e2e', '.spec.swcrc'), 'utf-8')
);

// Dezactivează căutarea fișierului .swcrc de către SWC core deoarece transmitem deja swcJestConfig manual
swcJestConfig.swcrc = false;

export default {
  displayName: '@recipe-delivery-app/api-e2e',
  preset: '../../jest.preset.js',
  setupFiles: ['<rootDir>/src/support/load-env.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  testTimeout: 30000,
};
