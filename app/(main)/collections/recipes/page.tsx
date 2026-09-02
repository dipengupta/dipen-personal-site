import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import { RECIPE_CATEGORIES, recipesWithSlugs } from '@/lib/main/recipes';

export const metadata: Metadata = { title: 'Recipes' };
export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const recipes = await recipesWithSlugs();
  return (
    <>
      <PageHeader eyebrow={{ label: 'Collections', href: '/collections' }} title="Recipes" intro="Things I cook often enough to have written down. Recipes saved from elsewhere link to their source." />
      <nav className="pill-row" aria-label="Categories">
        {RECIPE_CATEGORIES.map((c) => (
          <a key={c.key} className="pill" href={`#${c.key}`}>
            {c.label}
          </a>
        ))}
        <Link className="pill" href="/collections/spice-blends">
          Spice Blends
        </Link>
      </nav>
      {RECIPE_CATEGORIES.map((c) => {
        const rows = recipes.filter((r) => r.category === c.key);
        if (!rows.length) return null;
        return (
          <section key={c.key} id={c.key} className="section" aria-labelledby={`h-${c.key}`}>
            <div className="section-head">
              <h2 id={`h-${c.key}`}>{c.label}</h2>
              <span className="muted">{rows.length}</span>
            </div>
            <div className="grid">
              {rows.map((r) => (
                <Link key={r.id} id={`recipe-${r.id}`} href={`/collections/recipes/${r.slug}`} className="card">
                  <div className="card-body">
                    <h3>{r.title}</h3>
                    <p>{r.body.split('\n')[0].slice(0, 110)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
