/**
 * Append pennguytweets to src/data/seed/tweets.json.
 *
 *   npm run content:tweets -- --file ./new-tweets.txt
 *   npm run content:tweets -- --text "769/x the tweet text" [--date 2026-08-01] [--url https://x.com/...]
 *
 * File format: one tweet per block, blocks separated by a blank line.
 *   769/x traveling is dangerous when you are single
 *   2026-08-01                       (optional; ISO date or datetime)
 *   https://x.com/20swithepennguy/status/123   (optional)
 * A first line without the "N/x " prefix gets the next number automatically.
 *
 * Dedupes by number and by text, keeps the account's own numbering, and
 * requires a date for every row (the seeder refuses dateless tweets); missing
 * dates default to today. Then `npm run seed` and commit.
 */
import fs from 'node:fs';
import path from 'node:path';

interface Tweet {
  number: number;
  text: string;
  rawText: string;
  date: string;
  url: string | null;
}

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

const file = path.join(process.cwd(), 'src', 'data', 'seed', 'tweets.json');
const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as Tweet[];
const known = new Set(rows.map((t) => t.number));
const knownText = new Set(rows.map((t) => t.text.trim().toLowerCase()));
let nextNumber = Math.max(0, ...rows.map((t) => t.number)) + 1;

function parseBlock(lines: string[]): Tweet | null {
  const first = lines[0]?.trim();
  if (!first) return null;
  let number: number;
  let text: string;
  const m = /^(\d+)\/x\s+(.*)$/s.exec(first);
  if (m) {
    number = Number(m[1]);
    text = m[2].trim();
  } else {
    number = nextNumber++;
    text = first;
  }
  let date: string | undefined;
  let url: string | null = null;
  for (const line of lines.slice(1).map((l) => l.trim()).filter(Boolean)) {
    if (/^https?:\/\//.test(line)) url = line;
    else if (!Number.isNaN(Date.parse(line))) date = new Date(line).toISOString();
    else text += `\n${line}`;
  }
  return { number, text, rawText: `${number}/x ${text}`, date: date ?? new Date().toISOString(), url };
}

const blocks: string[][] = [];
if (flag('--file')) {
  const src = fs.readFileSync(path.resolve(flag('--file')!), 'utf8').replace(/\r\n/g, '\n');
  for (const block of src.split(/\n\s*\n/)) {
    const lines = block.split('\n').filter((l) => l.trim());
    if (lines.length) blocks.push(lines);
  }
} else if (flag('--text')) {
  blocks.push([flag('--text')!, ...(flag('--date') ? [flag('--date')!] : []), ...(flag('--url') ? [flag('--url')!] : [])]);
} else {
  console.error('usage: npm run content:tweets -- --file <tweets.txt> | --text "<text>" [--date <iso>] [--url <url>]');
  process.exit(1);
}

let added = 0;
for (const lines of blocks) {
  const t = parseBlock(lines);
  if (!t) continue;
  if (known.has(t.number)) {
    console.warn(`skip #${t.number}: number already present`);
    continue;
  }
  if (knownText.has(t.text.trim().toLowerCase())) {
    console.warn(`skip #${t.number}: text already present`);
    continue;
  }
  rows.push(t);
  known.add(t.number);
  knownText.add(t.text.trim().toLowerCase());
  added++;
}
rows.sort((a, b) => a.number - b.number);
fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`added ${added} tweet(s); ${rows.length} total`);
console.log('next: npm run seed && npm test, then commit.');
