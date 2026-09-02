/**
 * The main site's information architecture: sections, their pages, and the
 * one-line blurbs shown on overview pages and in the navigation. The header,
 * footer, sitemap and overview pages all render from this table, so a new
 * page is added here once.
 */
export interface PageDef {
  href: string;
  label: string;
  blurb: string;
}

export interface SectionDef {
  id: 'music' | 'collections' | 'about' | 'misc';
  href: string;
  label: string;
  blurb: string;
  pages: PageDef[];
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'music',
    href: '/music',
    label: 'Music',
    blurb: 'Guitars, videos, recordings and a college band.',
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
    href: '/collections',
    label: 'Collections',
    blurb: 'Things written, cooked, gathered and kept.',
    pages: [
      { href: '/collections/articles', label: 'Articles', blurb: 'Essays, saved in full.' },
      { href: '/collections/mugs', label: 'Mugs', blurb: 'A mug from every place, and who brought it.' },
      { href: '/collections/vinyls-and-magnets', label: 'Vinyls and Fridge Magnets', blurb: 'The shelf and the fridge door.' },
      { href: '/collections/recipes', label: 'Recipes', blurb: 'Food, baking, drinks, and tips.' },
      { href: '/collections/spice-blends', label: 'Spice Blends', blurb: 'Blends and marinades to keep on hand.' },
      { href: '/collections/kitchen-wins', label: 'Kitchen Wins', blurb: 'Things that came out well.' },
      { href: '/collections/alison', label: 'Alison', blurb: 'A photo collection, oldest to newest.' },
      { href: '/collections/pennguytweets', label: 'pennguytweets', blurb: 'The archive, numbered, newest first.' },
    ],
  },
  {
    id: 'about',
    href: '/about',
    label: 'About',
    blurb: 'Who I am, where I studied and where I have worked.',
    pages: [
      { href: '/about/academic', label: 'Academic', blurb: 'Projects and education.' },
      { href: '/about/professional', label: 'Professional', blurb: 'Roles, companies and dates.' },
    ],
  },
  {
    id: 'misc',
    href: '/misc',
    label: 'Misc',
    blurb: 'Lists that did not fit anywhere else.',
    pages: [
      { href: '/misc/concerts', label: 'Concerts Seen', blurb: 'Shows and events, by year.' },
      { href: '/misc/list', label: 'List', blurb: 'Two opinionated lists about America.' },
      { href: '/misc/wifi-names', label: 'Amusing Wi-Fi Names', blurb: 'Spotted in the wild.' },
      { href: '/misc/links', label: 'Links', blurb: 'Elsewhere on the internet.' },
    ],
  },
];

export const ALL_PAGES: PageDef[] = SECTIONS.flatMap((s) => [{ href: s.href, label: s.label, blurb: s.blurb }, ...s.pages]);

export function sectionById(id: SectionDef['id']): SectionDef {
  return SECTIONS.find((s) => s.id === id)!;
}

export function pageByHref(href: string): PageDef | undefined {
  return ALL_PAGES.find((p) => p.href === href);
}
