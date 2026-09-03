/**
 * Authored copy for the main site. Plain strings only: no em-dashes, no
 * emoji (tests/unit/mainCopy.test.ts enforces both). Quoted content (articles,
 * captions, tweets) comes from the database and is rendered as written.
 */
export const SITE_NAME = 'Dipen Gupta';
export const SITE_TAGLINE = 'Software developer, musician, Penn State graduate.';
export const SITE_DESCRIPTION =
  "Dipen Gupta's personal website: guitars, videos, recipes, articles, collections, and a few other ways to browse it all.";

/**
 * Hero photos, in order: the profile shots where the face is the subject
 * (paths under /media/images/home). Portrait photos are cropped high so the
 * face stays in frame on a wide hero.
 */
export const HERO_PHOTOS = [
  '/media/images/home/acoustic_profile.webp',
  '/media/images/home/main.webp',
  '/media/images/home/mountain-rails.webp',
  '/media/images/home/indianapolis-suit.webp',
  '/media/images/home/prof_guitar.webp',
  '/media/images/home/bucees.webp',
  '/media/images/home/tahoe-boat-flag.webp',
  '/media/images/home/doubleneck_profile.webp',
];

export const HOME = {
  greeting: "Hi, I'm Dipen.",
  intro:
    "I'm a software developer, musician and a Penn State graduate, and this site is a home for the things I make and keep: guitars and the videos I record with them, recipes and spice blends, articles, a mug collection that grew out of hand, and a few other odds and ends.",
  exploreHeading: 'Explore',
  viewsHeading: 'Two other ways to browse this site',
  viewsIntro: 'Everything here is also available as a working iPod Classic and as an old-school iTunes window!',
  ipodCard: {
    title: 'iPod',
    body: 'Spin the click wheel, flip through Cover Flow, and let the music keep playing while you browse. Works on phones too.',
  },
  itunesCard: {
    title: 'iTunes',
    body: 'A source list, a grid, Cover Flow, a global search box and transport controls, the way it looked in 2007. Desktop only.',
    mobileNote: 'iTunes needs a larger screen; on a phone it opens the iPod instead.',
  },
  mosaicHeading: 'A few pictures',
} as const;

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export const SOCIALS: SocialLink[] = [
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@DipenGupta' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/dipengupta/' },
  { id: 'soundcloud', label: 'SoundCloud', url: 'https://soundcloud.com/dipen-gupta' },
  { id: 'substack', label: 'Substack', url: 'https://dipengupta.substack.com' },
  { id: 'medium', label: 'Medium', url: 'https://medium.com/@escapesequencemovies' },
  { id: 'github', label: 'GitHub', url: 'https://github.com/dipengupta' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/dipen-gupta-ab6b5071/' },
  { id: 'x', label: 'X', url: 'https://x.com/20swithepennguy' },
  { id: 'threads', label: 'Threads', url: 'https://www.threads.net/@dipengupta' },
];

export const FOOTER = {
  madeBy: 'Made from scratch by Dipen',
  lastUpdatedPrefix: 'last updated',
} as const;

export const ABOUT = {
  heading: 'About',
  intro:
    "I'm Dipen: a software developer by trade, a guitarist since 2009, and a collector of small things (mugs, magnets, vinyls, recipes). I grew up in Mumbai, did my master's at Penn State Harrisburg, and now live and work in Pennsylvania.",
  journeyIntro:
    'Every job and every classroom, on one line and newest first. Filled dots are work, hollow ones are school.',
  journeyWorkLabel: 'Work',
  journeyEducationLabel: 'School',
  projectsIntro: 'Things I have built, on my own and with other people, newest first.',
} as const;
