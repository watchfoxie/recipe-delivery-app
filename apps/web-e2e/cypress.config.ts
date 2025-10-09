import { config as loadEnv } from 'dotenv';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
import { resolve } from 'path';

loadEnv({
  path: resolve(__dirname, '../../.env'),
  override: true,
});

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'npx nx run @recipe-delivery-app/web:dev',
      },
      ciWebServerCommand: 'npx nx run @recipe-delivery-app/web:start',
      ciBaseUrl: 'http://localhost:3000',
    }),
    baseUrl: 'http://127.0.0.1:3000',
  },
});
