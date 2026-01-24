const rawCorsOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:3000';
const corsOrigins = rawCorsOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllCorsOrigins = corsOrigins.includes('*');

export const APP_CONFIG = {
  swagger: {
    title: 'Recipe Delivery API',
    description:
      'REST API pentru gestionarea utilizatorilor, rețetelor și ingredientelor într-o aplicație de livrare rețete.',
    version: '1.0.0',
    path: 'api/docs',
  },
  server: {
    port: Number(process.env.NEST_PORT ?? 3001),
    environment: process.env.NODE_ENV ?? 'development',
  },
  cors: {
    origins: allowAllCorsOrigins ? ['*'] : corsOrigins,
    allowAllOrigins: allowAllCorsOrigins,
    credentials: !allowAllCorsOrigins,
  },
  validation: {
    whitelist: true,
    transform: true,
  },
} as const;
