import { config as loadEnv } from 'dotenv';
import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import { resolve } from 'path';
loadEnv({
  path: resolve(process.cwd(), '.env'),
  override: true,
});

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  displayName: '@recipe-delivery-app/web',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  testEnvironment: 'jsdom',
  forceExit: true,
};

export default createJestConfig(config);
