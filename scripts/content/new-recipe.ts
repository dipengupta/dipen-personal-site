/**
 * Add a recipe (or a spice blend) to the seed data.
 *
 *   npm run content:recipe -- --title "Khao Soi" --category food --body-file ./khao-soi.txt \
 *       [--source-url https://... --source-label "View original recipe"]
 *   npm run content:recipe -- --spice --title "Taco Seasoning" --body-file ./taco.txt
 *
 * Missing flags are asked for interactively. The body is plain text: blank
 * lines separate paragraphs, lines starting with "- " are list items (all
 * three views render it as written). Appends to src/data/seed/recipes.json or
 * spice-blends.json; then `npm run seed` locally and commit. The deploy-time
 * seed sync picks the change up on the next boot.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

const CATEGORIES = ['food', 'baking', 'drinks', 'tips'] as const;
type Category = (typeof CATEGORIES)[number];

interface Recipe {
  title: string;
  category?: Category;
  body: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const spice = argv.includes('--spice');
const file = path.join(process.cwd(), 'src', 'data', 'seed', spice ? 'spice-blends.json' : 'recipes.json');

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (q: string, fallback?: string) => fallback ?? (await rl.question(`${q}: `)).trim();

  const title = await ask('Title', flag('--title'));
  if (!title) throw new Error('title is required');
  let category: Category | undefined;
  if (!spice) {
    const c = await ask(`Category (${CATEGORIES.join('/')})`, flag('--category'));
    if (!CATEGORIES.includes(c as Category)) throw new Error(`category must be one of ${CATEGORIES.join(', ')}`);
    category = c as Category;
  }
  const bodyFile = flag('--body-file');
  let body = flag('--body') ?? (bodyFile ? fs.readFileSync(path.resolve(bodyFile), 'utf8') : '');
  if (!body) {
    console.log('Body (finish with a line containing only "."):');
    const lines: string[] = [];
    for (;;) {
      const line = await rl.question('');
      if (line.trim() === '.') break;
      lines.push(line);
    }
    body = lines.join('\n');
  }
  body = body.replace(/\r\n/g, '\n').trim();
  if (!body) throw new Error('body is required');
  const sourceUrl = flag('--source-url') ?? (argv.includes('--no-source') ? '' : await ask('Source URL (blank if none)', undefined));
  const sourceLabel = sourceUrl ? (flag('--source-label') ?? 'View original recipe') : undefined;
  rl.close();

  const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as Recipe[];
  if (rows.some((r) => r.title.toLowerCase() === title.toLowerCase())) {
    throw new Error(`"${title}" already exists in ${path.basename(file)}`);
  }
  const row: Recipe = { title, ...(category ? { category } : {}), body, ...(sourceUrl ? { sourceUrl, sourceLabel } : {}) };
  rows.push(row);
  fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`added "${title}" to ${path.relative(process.cwd(), file)} (${rows.length} rows)`);
  console.log('next: npm run seed && npm test, then commit.');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
