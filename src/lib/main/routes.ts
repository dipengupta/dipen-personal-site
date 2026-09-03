/**
 * The main site's information architecture: sections and their pages, with
 * the one-line blurbs used in navigation. Sections have no landing page of
 * their own: a top-level nav item opens the dropdown and links to the
 * section's first page. The header, footer and sitemap render from this
 * table, so a new page is added here once.
 */
export interface PageDef {
  href: string;
  label: string;
  blurb: string;
}

export interface SectionDef {
  id: 'music' | 'collections' | 'about' | 'misc';
  label: string;
  pages: PageDef[];
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'music',
    label: 'Music',
    pages: [
      { href: '/music/guitars', label: 'Guitars', blurb: 'The collection, oldest to newest.' },
      { href: '/music/youtube', label: 'YouTube', blurb: 'Playing videos going back to 2010.' },
      { href: '/music/instagram', label: 'Instagram', blurb: 'UGG Chronicles, the practice clips, by year.' },
      { href: '/music/soundcloud', label: 'SoundCloud', blurb: 'The Side Project, jams from 2012 to 2014.' },
      { href: '/music/octavium', label: 'Octavium', blurb: 'The college band.' },
    ],
  },
  {
    id: 'collections',
    label: 'Collections',
    pages: [
      { href: '/collections/articles', label: 'Articles', blurb: 'Essays, saved in full.' },
      { href: '/collections/mugs-vinyls-and-magnets', label: 'Mugs, Vinyls and Magnets', blurb: 'The mug shelf, the record shelf and the fridge door.' },
      { href: '/collections/recipes', label: 'Recipes and Spice Blends', blurb: 'Food, baking, drinks, tips, and the blends to keep on hand.' },
      { href: '/collections/alison', label: 'Alison', blurb: 'A photo collection, oldest to newest.' },
      { href: '/collections/pennguytweets', label: 'pennguytweets', blurb: 'The archive, numbered, newest first.' },
    ],
  },
  {
    id: 'about',
    label: 'About',
    pages: [
      { href: '/about/journey', label: 'Journey', blurb: 'Work and school, on one timeline.' },
      { href: '/about/projects', label: 'Projects', blurb: 'Things I have built, newest first.' },
    ],
  },
  {
    id: 'misc',
    label: 'Misc',
    pages: [
      { href: '/misc/concerts', label: 'Concerts Seen', blurb: 'Shows and events, by year.' },
      { href: '/misc/list', label: 'List', blurb: 'Two opinionated lists about America.' },
      { href: '/misc/wifi-names', label: 'Amusing Wi-Fi Names', blurb: 'Spotted in the wild.' },
      { href: '/misc/links', label: 'Links', blurb: 'Elsewhere on the internet.' },
    ],
  },
];

export const ALL_PAGES: PageDef[] = SECTIONS.flatMap((s) => s.pages);

/** Where a section's top-level nav item points: its first page. */
export function sectionHref(section: SectionDef): string {
  return section.pages[0].href;
}

export function sectionById(id: SectionDef['id']): SectionDef {
  return SECTIONS.find((s) => s.id === id)!;
}

export function pageByHref(href: string): PageDef | undefined {
  return ALL_PAGES.find((p) => p.href === href);
}

/** Old and section URLs that should keep working. */
export const REDIRECTS: Array<{ source: string; destination: string }> = [
  { source: '/music', destination: '/music/guitars' },
  { source: '/collections', destination: '/collections/recipes' },
  { source: '/about', destination: '/about/journey' },
  { source: '/about/academic', destination: '/about/projects' },
  { source: '/about/professional', destination: '/about/journey' },
  { source: '/misc', destination: '/misc/concerts' },
  { source: '/collections/mugs', destination: '/collections/mugs-vinyls-and-magnets' },
  { source: '/collections/vinyls-and-magnets', destination: '/collections/mugs-vinyls-and-magnets' },
  { source: '/collections/spice-blends', destination: '/collections/recipes' },
  { source: '/collections/kitchen-wins', destination: '/collections/recipes' },
  { source: '/collections/spice-blends/:slug', destination: '/collections/recipes/:slug' },
];
