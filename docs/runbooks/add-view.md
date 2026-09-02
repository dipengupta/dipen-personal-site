# Add a new view (a new subdomain)

A "view" is another front-end over the same data, addressed as
`<name>.dipengupta.com` and, as a fallback, `/<name>`.

1. Register it in `src/lib/site/views.ts`:
   ```ts
   gameboy: { id: 'gameboy', label: "Dipen's Game Boy", subdomain: 'gameboy', path: '/gameboy' },
   ```
   and add `'gameboy'` to the `ViewId` union. The middleware, `viewHref()`
   and the unit tests pick it up automatically.
2. Create the route: `app/(devices)/gameboy/page.tsx` (shares the device root
   layout: theme cookies, no user scaling) or a new route group with its own
   `layout.tsx` if it needs a different document shell.
3. Read data through `src/lib/content/queries.ts` (server) or the `/api/...`
   routes (client), never a third copy of the queries.
4. Link to it: the main site's "other views" cards (`src/content/site.ts`)
   and, if you like, a DEVICES row in `src/lib/itunes/catalog.ts`
   (`viewId: 'gameboy'`).
5. Add `fly certs add gameboy.dipengupta.com` and a CNAME (see deploy.md).
6. Tests: extend `tests/unit/siteViews.test.ts` and `e2e/hostRouting.spec.ts`
   (`http://gameboy.localhost:3000/`).
