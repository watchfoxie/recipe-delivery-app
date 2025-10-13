import { waitForPortOpen } from '@nx/node/utils';
import * as dotenv from 'dotenv';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Încarcă variabilele de mediu din fișierul .env
  dotenv.config({ path: '../../../.env' });

  // Pornește serviciile de care aplicația are nevoie pentru a rula (de exemplu, baza de date, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3001;
  await waitForPortOpen(port, { host });

  // Trebuie să folosesc `globalThis` pentru a transmite variabile către procesul de teardown global.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
