/* eslint-disable */
import axios from 'axios';
import * as dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env
dotenv.config({ path: '../../../.env' });

module.exports = async function () {
  // Configurează axios pentru a fi folosit în teste.
  const host =
    process.env.API_HOST ??
    process.env.APP_HOST ??
    process.env.DB_HOST ??
    '127.0.0.1';
  const port = process.env.NEST_PORT ?? '3001';
  axios.defaults.baseURL = `http://${host}:${port}/api`;
};
