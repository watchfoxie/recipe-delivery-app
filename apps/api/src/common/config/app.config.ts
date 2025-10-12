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
  validation: {
    whitelist: true,
    transform: true,
  },
} as const;
