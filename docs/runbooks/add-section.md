# Add a content section (new table)

The data spine is shared, so a section is added once and surfaced per view.

1. **Schema**: add a table in `src/lib/db/schema.ts`; `npm run db:generate`
   and commit the migration under `drizzle/`.
2. **Seed**: a JSON file in `src/data/seed/` and a `SeedUnit` in
   `src/lib/seed/seedDb.ts` (fingerprint = the file). The deploy-time sync
   fills the table on the next boot; no manual reseed.
3. **Queries**: add a key to `sections` in `src/lib/content/queries.ts`. It is
   now served at `/api/content/<key>` for the device views and callable from
   main-site server components.
4. **Search**: add a group in `src/lib/search/searchContent.ts` (with the
   iTunes `entryId` and a `focusId`), and a target in
   `src/lib/main/searchTargets.ts` so main-site results link to the right page.
5. **Main site**: a page under `app/(main)/...`, an entry in
   `src/lib/main/routes.ts` (nav + footer + sitemap) and copy in `src/content/`.
6. **iPod**: builder in `src/lib/menu/dataSources.ts` + node in
   `src/lib/menu/tree.ts`. **iTunes**: loader in `src/lib/itunes/loaders.ts` +
   row in `src/lib/itunes/catalog.ts`.
7. **Tests + docs**: `tests/unit/tree.test.ts`, `itunesCatalog.test.ts`,
   `tests/integration/routes.test.ts`, an e2e check per view, and
   `docs/architecture.md`.
