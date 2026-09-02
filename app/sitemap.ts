import type { MetadataRoute } from 'next';
import { listArticles } from '@/lib/content/queries';
import { recipesWithSlugs, spiceBlendsWithSlugs } from '@/lib/main/recipes';
import { ALL_PAGES } from '@/lib/main/routes';
import { siteOrigin } from '@/lib/site/origin';
import { DEVICE_VIEWS } from '@/lib/site/views';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [articles, recipes, blends] = await Promise.all([listArticles(), recipesWithSlugs(), spiceBlendsWithSlugs()]);
  return [
    { url: `${origin}/`, priority: 1 },
    ...ALL_PAGES.map((p) => ({ url: `${origin}${p.href}`, priority: 0.7 })),
    ...articles.map((a) => ({ url: `${origin}/collections/articles/${a.slug}`, priority: 0.6 })),
    ...recipes.map((r) => ({ url: `${origin}/collections/recipes/${r.slug}`, priority: 0.5 })),
    ...blends.map((b) => ({ url: `${origin}/collections/spice-blends/${b.slug}`, priority: 0.5 })),
    ...DEVICE_VIEWS.map((v) => ({ url: `${origin}${v.path}`, priority: 0.4 })),
  ];
}
