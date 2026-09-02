# Add a recipe or spice blend

Recipes live in `src/data/seed/recipes.json` (categories: food, baking,
drinks, tips); spice blends and marinades in `src/data/seed/spice-blends.json`.
All three views read the same rows.

```bash
# from a text file (blank line = new paragraph, "- " = list item)
npm run content:recipe -- --title "Khao Soi" --category food --body-file ./khao-soi.txt \
  --source-url "https://example.com/khao-soi" --source-label "View original recipe"

# a spice blend (no category)
npm run content:recipe -- --spice --title "Taco Seasoning" --body-file ./taco.txt --no-source

# or just answer the prompts
npm run content:recipe
```

Then:

```bash
npm run seed      # local database picks up the new row
npm test          # seed + search tests
git add src/data/seed && git commit -m "Add recipe: Khao Soi"
```

On deploy the container re-seeds only the recipes table (its file fingerprint
changed), so nothing else on the volume is touched. A recipe with a
`sourceUrl` shows a "View original" link in every view.
