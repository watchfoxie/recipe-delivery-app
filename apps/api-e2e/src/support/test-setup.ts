/* eslint-disable */
import axios from 'axios';
import * as dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env
dotenv.config({ path: '../../../.env' });

module.exports = async function () {
  // Configurează axios pentru a fi folosit în teste.
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.NEST_PORT ?? '3001';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
