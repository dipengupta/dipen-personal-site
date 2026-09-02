import { getSection } from '@/lib/content/queries';
import { slugify } from './slug';

export const RECIPE_CATEGORIES: Array<{ key: 'food' | 'baking' | 'drinks' | 'tips'; label: string }> = [
  { key: 'food', label: 'Food' },
  { key: 'baking', label: 'Baking' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'tips', label: 'Tips and Tricks' },
];

export async function recipesWithSlugs() {
  return (await getSection('recipes')).map((r) => ({ ...r, slug: slugify(r.title) }));
}

export async function spiceBlendsWithSlugs() {
  return (await getSection('spiceBlends')).map((r) => ({ ...r, slug: slugify(r.title) }));
}
