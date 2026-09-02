import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * House style for the main site: no em-dashes, no en-dashes, no emoji in
 * anything Dipen authored (UI code, copy, the academic seed). Quoted content
 * from the database (articles, captions, tweets) is rendered as written and
 * is not scanned here.
 */
const ROOTS = ['app/(main)', 'src/components/main', 'src/content', 'src/lib/main', 'src/data/seed/academic.json'];
const EXT = new Set(['.ts', '.tsx', '.css', '.json']);
const EM_DASH = /[–—]/;
// Pictographic emoji, symbols and the variation selector / ZWJ that glue them.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/u;

function* walk(dir: string): Generator<string> {
  const full = path.join(process.cwd(), dir);
  if (fs.statSync(full).isFile()) {
    yield full;
    return;
  }
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (EXT.has(path.extname(entry.name))) yield path.join(process.cwd(), p);
  }
}

describe('main-site copy hygiene', () => {
  const files = ROOTS.flatMap((r) => [...walk(r)]);

  it('scans a meaningful set of files', () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it('contains no em-dashes or en-dashes', () => {
    const offenders = files.filter((f) => EM_DASH.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(process.cwd(), f));
    expect(offenders).toEqual([]);
  });

  it('contains no emoji', () => {
    const offenders = files.filter((f) => EMOJI.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(process.cwd(), f));
    expect(offenders).toEqual([]);
  });
});
