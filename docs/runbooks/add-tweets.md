# Add pennguytweets

The archive is `src/data/seed/tweets.json` (the account's own `N/x`
numbering). Every row needs a date; the seeder refuses dateless tweets.

```bash
# one tweet
npm run content:tweets -- --text "769/x the text" --date 2026-08-01 --url "https://x.com/20swithepennguy/status/123"

# a batch: blocks separated by blank lines
cat > new.txt <<'T'
769/x the first one
2026-08-01
https://x.com/20swithepennguy/status/123

770/x the second one, date defaults to today
T
npm run content:tweets -- --file new.txt
npm run seed && npm test
git add src/data/seed/tweets.json && git commit -m "Add pennguytweets #769-770"
```

Duplicates (by number or text) are skipped, and the rows are re-sorted by
number, so a batch with gaps or out of order is fine. Two counts are
hardcoded and fail until updated in the same change:
`tests/integration/seed.test.ts` (total rows) and
`tests/integration/routes.test.ts` (total rows, and the newest number).

The iPod's Settings has a shuffle toggle; iTunes has a shuffle button. The
main site has a Newest first / Shuffle switch
(`src/components/main/Segmented.tsx`, shared with the Alison page), where a
click on Shuffle reshuffles even when it is already selected.
