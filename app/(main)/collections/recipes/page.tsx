import type { Metadata } from 'next';
import Link from 'next/link';
import Mosaic, { type MosaicImage } from '@/components/main/Mosaic';
import PageHeader from '@/components/main/PageHeader';
import { pictureData } from '@/components/main/Picture';
import { getSection } from '@/lib/content/queries';
import { RECIPE_CATEGORIES, recipesWithSlugs, spiceBlendsWithSlugs } from '@/lib/main/recipes';

export const metadata: Metadata = { title: 'Recipes and Spice Blends' };
export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const [recipes, blends, kitchen] = await Promise.all([recipesWithSlugs(), spiceBlendsWithSlugs(), getSection('kitchen')]);
  const strip: MosaicImage[] = kitchen.map((k) => ({ ...pictureData(k.imagePath), alt: k.title, href: '/collections/kitchen-wins' }));
  const groups = [
    ...RECIPE_CATEGORIES.map((c) => ({
      id: c.key,
      label: c.label,
      rows: recipes.filter((r) => r.category === c.key).map((r) => ({ id: `recipe-${r.id}`, title: r.title, href: `/collections/recipes/${r.slug}` })),
    })),
    {
      id: 'spice-blends',
      label: 'Spice Blends',
      rows: blends.map((b) => ({ id: `spice-${b.id}`, title: b.title, href: `/collections/recipes/${b.slug}` })),
    },
  ];
  return (
    <>
      <PageHeader eyebrow="Collections" title="Recipes and Spice Blends" intro="Things I cook often enough to have written down, and the blends to keep on hand." />
      <div style={{ marginBottom: '2rem' }}>
        <Mosaic images={strip} />
      </div>
      <nav className="pill-row" aria-label="Categories">
        {groups.map((g) => (
          <a key={g.id} className="pill" href={`#${g.id}`}>
            {g.label} <span className="muted">{g.rows.length}</span>
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`h-${g.id}`}>
          <div className="group-head">
            <h2 id={`h-${g.id}`}>{g.label}</h2>
            <span className="muted">{g.rows.length}</span>
          </div>
          <ul className="compact-list">
            {g.rows.map((r) => (
              <li key={r.id} id={r.id}>
                <Link href={r.href}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
