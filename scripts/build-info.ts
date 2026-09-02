/**
 * Writes src/generated/build-info.json, which the footer reads for
 * "Made from scratch by Dipen, last updated <month year>".
 *
 * Source of the date, in order: BUILD_DATE env (set by Dockerfile ARG from
 * scripts/deploy.sh, which passes the last commit date), then the last git
 * commit date when .git is available, then "now". GIT_SHA is recorded the
 * same way. Runs as `prebuild`, so `next build` always has a fresh file.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
}

const lastUpdated = process.env.BUILD_DATE || git(['log', '-1', '--format=%cI']) || new Date().toISOString();
const commit = process.env.GIT_SHA || git(['rev-parse', '--short', 'HEAD']) || 'unknown';
const info = { lastUpdated: new Date(lastUpdated).toISOString(), commit, builtAt: new Date().toISOString() };

const out = path.join(process.cwd(), 'src', 'generated');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'build-info.json'), `${JSON.stringify(info, null, 2)}\n`);
console.log(`build-info: last updated ${info.lastUpdated} (${info.commit})`);
