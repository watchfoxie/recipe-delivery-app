/* eslint-disable */
import { killPort } from '@nx/node/utils';
import * as dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env
dotenv.config({ path: '../../../.env' });

module.exports = async function () {
  // Trebuie să scriu aici logica de curățare (de exemplu, oprirea serviciilor, docker-compose, etc.).
  // `globalThis` este partajat între setup și teardown.
  const port = process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3001;
  await killPort(port);
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
