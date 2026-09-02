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

/** Recipes and spice blends share one URL space: /collections/recipes/<slug>. */
export async function findRecipeOrBlend(slug: string) {
  const [recipes, blends] = await Promise.all([recipesWithSlugs(), spiceBlendsWithSlugs()]);
  const recipe = recipes.find((r) => r.slug === slug);
  if (recipe) {
    return { kind: 'recipe' as const, ...recipe, categoryLabel: RECIPE_CATEGORIES.find((c) => c.key === recipe.category)?.label };
  }
  const blend = blends.find((b) => b.slug === slug);
  return blend ? { kind: 'blend' as const, ...blend, categoryLabel: undefined } : null;
}
