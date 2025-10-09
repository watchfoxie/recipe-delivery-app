//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config: loadEnv } = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

loadEnv({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  webpack: (config) => {
    // Provide Webpack aliases so runtime resolution matches tsconfig paths
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@web': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, '../api/src'),
      '@shared': path.resolve(__dirname, '../../libs/shared/src'),
    };
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
