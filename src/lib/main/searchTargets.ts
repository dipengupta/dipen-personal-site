import { slugify } from './slug';

/**
 * Where a search result opens on the main site. Results carry the group
 * `type` and a `focusId` shared with iTunes (src/lib/search/searchContent.ts);
 * pages scroll to and highlight `#<focusId>` when present (useFocusHash).
 */
export function searchResultHref(type: string, id: string, title: string): string {
  switch (type) {
    case 'tweets':
      return `/collections/pennguytweets#${id}`;
    case 'articles':
      return `/collections/articles/${id}`;
    case 'recipes':
      return `/collections/recipes/${slugify(title)}`;
    case 'spiceBlends':
      return `/collections/recipes/${slugify(title)}`;
    case 'videos':
      return id.startsWith('ugg-') ? `/music/instagram#${id}` : `/music/youtube#${id}`;
    case 'guitars':
      return `/music/guitars#${id}`;
    case 'photos':
      if (id.startsWith('dish-')) return '/collections/recipes';
      if (id.startsWith('alison-')) return `/collections/alison#${id}`;
      return `/#${id}`;
    case 'mugs':
      return `/collections/mugs-vinyls-and-magnets#${id}`;
    case 'timeline':
      return `/about/professional#${id}`;
    case 'academic':
      return `/about/academic#${id}`;
    case 'concerts':
      return `/misc/concerts#${id}`;
    case 'links':
      return `/misc/links#${id}`;
    case 'wifi':
      return `/misc/wifi-names#${id}`;
    case 'list':
      return `/misc/list#${id}`;
    case 'pages':
      if (id === 'octavium') return '/music/octavium';
      if (id === 'vinyls' || id === 'magnets') return `/collections/mugs-vinyls-and-magnets#${id}`;
      return '/#contact';
    default:
      return '/search';
  }
}
