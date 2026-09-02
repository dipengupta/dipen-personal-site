/**
 * Save a new article's full text so it survives the source going away.
 *
 *   npm run content:article -- --title "On paper" --source-url https://dipengupta.substack.com/p/on-paper \
 *       --published "Jun 2025" --body-file ./on-paper.html [--subtitle "..."] [--source-label "View original source on Substack"]
 *
 * --body-file may be .html (kept as-is) or .txt/.md (plain text; paragraphs
 * separated by blank lines, rendered with Django-style linebreaks). Writes
 * src/data/seed/articles/article<N>.html in the template format the seeder
 * parses (src/lib/seed/parseArticle.ts). Newest articles get the highest
 * number and sort first. Then `npm run seed` and commit.
 *
 * Tip: for Substack posts, "Export" in the Substack dashboard gives you the
 * HTML; or save the page and pass the article's <div class="body"> part.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

const title = flag('--title');
const sourceUrl = flag('--source-url');
const published = flag('--published');
const bodyFile = flag('--body-file');
if (!title || !sourceUrl || !published || !bodyFile) {
  console.error('usage: npm run content:article -- --title <t> --source-url <url> --published "<Mon YYYY>" --body-file <file.html|.txt> [--subtitle <s>] [--source-label <l>]');
  process.exit(1);
}
const host = new URL(sourceUrl).hostname;
const sourceLabel = flag('--source-label') ?? (host.includes('substack') ? 'View original source on Substack' : host.includes('medium') ? 'View original source on Medium' : 'View original source');
const subtitle = flag('--subtitle');

const dir = path.join(process.cwd(), 'src', 'data', 'seed', 'articles');
const existing = fs.readdirSync(dir).map((f) => /^article(\d+)\.html$/.exec(f)?.[1]).filter(Boolean).map(Number);
const next = (existing.length ? Math.max(...existing) : 0) + 1;
const out = path.join(dir, `article${next}.html`);

const raw = fs.readFileSync(path.resolve(bodyFile), 'utf8').replace(/\r\n/g, '\n').trim();
const isHtml = /\.html?$/i.test(bodyFile);
const body = isHtml ? raw : `{% filter linebreaks %}\n${raw}\n{% endfilter %}`;
const esc = (s: string) => s.replace(/\{%/g, '{ %');

const template = [
  '{% extends "articles/base_saved_article.html" %}',
  '',
  `{% block article_title %}${esc(title)}{% endblock %}`,
  ...(subtitle ? [`{% block article_subtitle %}<p class="text-muted mb-1">${esc(subtitle)}</p>{% endblock %}`] : []),
  `{% block article_source_url %}${sourceUrl}{% endblock %}`,
  `{% block article_source_label %}${esc(sourceLabel)}{% endblock %}`,
  `{% block article_published_label %}Published ${esc(published)}{% endblock %}`,
  '',
  '{% block article_body %}',
  body,
  '{% endblock %}',
  '',
].join('\n');
fs.writeFileSync(out, template);
console.log(`wrote ${path.relative(process.cwd(), out)}`);
console.log('next: npm run seed && npm test, then commit.');
