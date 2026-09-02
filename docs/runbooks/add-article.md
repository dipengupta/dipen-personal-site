# Add an article

Articles arrive two ways:

1. **Automatically**: the Substack RSS feed is polled (24h staleness) and new
   posts are inserted additively with their full HTML. Nothing to do.
2. **Saved copy** (recommended for anything you care about): commit the full
   text so it survives the source disappearing, and so search and the iPod
   have it offline.

```bash
npm run content:article -- \
  --title "On paper" \
  --source-url "https://dipengupta.substack.com/p/on-paper" \
  --published "Jun 2025" \
  --subtitle "an optional dek" \
  --body-file ./on-paper.html        # or .txt (plain paragraphs)
npm run seed && npm test
git add src/data/seed/articles && git commit -m "Save article: On paper"
```

The script writes `src/data/seed/articles/article<N>.html` in the template
format `src/lib/seed/parseArticle.ts` understands. The seeder de-duplicates
against RSS rows by slug, URL and normalized title, and article HTML is
sanitized when it is stored. Newest number sorts first.
