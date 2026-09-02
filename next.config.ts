import { execFileSync } from 'node:child_process';
import type { NextConfig } from 'next';
import { securityHeaders } from './src/lib/site/securityHeaders';

/**
 * Footer "last updated": the last commit date, read from git at build time
 * (or from BUILD_DATE / GIT_SHA, which scripts/deploy.sh passes into the
 * Docker build since .git is not in the build context). Falls back to now.
 */
function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
}
const buildDate = process.env.BUILD_DATE || git(['log', '-1', '--format=%cI']) || new Date().toISOString();
const gitSha = process.env.GIT_SHA || git(['rev-parse', '--short', 'HEAD']) || 'dev';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  // The e2e server builds into its own directory so it can run alongside `next dev`.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date(buildDate).toISOString(),
    NEXT_PUBLIC_GIT_SHA: gitSha,
  },
};

export default nextConfig;
