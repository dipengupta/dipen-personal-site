import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  // The e2e server builds into its own directory so it can run alongside `next dev`.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default nextConfig;
