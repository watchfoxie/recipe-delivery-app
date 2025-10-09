import axios from 'axios';
import * as dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env
dotenv.config({ path: '../../../.env' });

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: `Hello API, DB_HOST: ${process.env.DB_HOST}` });
  });
});
