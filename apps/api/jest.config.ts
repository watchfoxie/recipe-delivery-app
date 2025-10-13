/* eslint-disable */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const swcConfigPathCandidates = [
  resolve(process.cwd(), '.spec.swcrc'),
  resolve(process.cwd(), 'apps/api/.spec.swcrc'),
  resolve(process.cwd(), '../../apps/api/.spec.swcrc'),
];

const swcConfigPath = swcConfigPathCandidates.find((candidate) =>
  existsSync(candidate)
);

if (!swcConfigPath) {
  throw new Error('Unable to locate .spec.swcrc for api Jest configuration');
}

// Citirea configurației de compilare SWC pentru fișierele de test (spec)
const swcJestConfig = JSON.parse(
  readFileSync(swcConfigPath, 'utf-8')
);

// Dezactivează căutarea fișierului .swcrc de către SWC core deoarece transmitem deja swcJestConfig manual
swcJestConfig.swcrc = false;

export default {
  displayName: '@recipe-delivery-app/api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
};
