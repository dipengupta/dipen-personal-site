import { MAGNETS, OCTAVIUM, VINYLS } from '@/lib/content/static';
import type { MenuNode } from './types';

const ABOUT_TEXT = `Hi, I'm Dipen. This is my personal website, built as a 1:1 replica of the iPod Classic.

New to one of these? Spin the click wheel (or use your arrow keys) to move up and down. Press the center button (or Enter) to open whatever's highlighted, and press Menu (the top of the wheel, or Esc/Backspace) to go back. That's the whole thing.

One handy trick: when something's playing, press and hold the center button to jump straight to Now Playing from anywhere.

So go explore: my music and guitars, articles I've written, my work history, recipes, photos, and a pile of other odds and ends under Misc. Poke around, there's more in here than it looks.

Everything in here is real, built with Next.js, SQLite and a lot of CSS!

Want to say hi? I'm at dipenrgupta@icloud.com.

Dipen :)`;

export const menuTree: MenuNode = {
  id: 'root',
  label: "Dipen's iPod",
  view: 'splitMenu',
  children: [
    {
      id: 'music',
      label: 'Music',
      view: 'splitMenu',
      previewImage: '/media/images/music/0_GuitarRack.webp',
      children: [
        {
          id: 'music.guitars',
          label: 'Guitars',
          view: 'coverflow',
          dataSource: 'guitars',
          previewImage: '/media/images/music/12_Slash_LP.webp',
        },
        {
          id: 'music.youtube',
          label: 'YouTube',
          view: 'list',
          dataSource: 'youtube',
          groupBy: 'year',
        },
        {
          id: 'music.instagram',
          label: 'Instagram',
          view: 'list',
          dataSource: 'ugg',
        },
        {
          id: 'music.soundcloud',
          label: 'SoundCloud',
          view: 'list',
          dataSource: 'soundcloud',
        },
        {
          id: 'music.recommendations',
          label: 'Recommendations',
          view: 'list',
          dataSource: 'recommendations',
        },
        {
          id: 'music.octavium',
          label: 'Octavium',
          view: 'photo',
          previewImage: '/media/images/music/Octavium.webp',
          payload: { ...OCTAVIUM },
        },
      ],
    },
    {
      id: 'collections',
      label: 'Collections',
      view: 'splitMenu',
      previewImage: '/media/images/travel/mugs.webp',
      children: [
        {
          id: 'collections.mugs',
          label: 'Mug Collection',
          view: 'list',
          dataSource: 'mugs',
          previewImage: '/media/images/travel/mugs.webp',
        },
        {
          id: 'collections.vinyls',
          label: 'Vinyls',
          view: 'photo',
          previewImage: '/media/images/travel/vinyls.webp',
          payload: { ...VINYLS },
        },
        {
          id: 'collections.magnets',
          label: 'Fridge Magnets',
          view: 'photo',
          previewImage: '/media/images/travel/fridge-magnets.webp',
          payload: { ...MAGNETS },
        },
        {
          id: 'collections.recipes',
          label: 'Recipes',
          view: 'list',
          dataSource: 'recipes',
        },
        {
          id: 'collections.spiceBlends',
          label: 'Spice Blends',
          view: 'list',
          dataSource: 'spiceBlends',
        },
        {
          id: 'collections.alison',
          label: 'Alison',
          view: 'coverflow',
          dataSource: 'alison',
          previewImage: '/media/images/alison/alison-001.webp',
        },
      ],
    },
    {
      id: 'professional',
      label: 'Professional',
      view: 'list',
      dataSource: 'timeline',
    },
    {
      id: 'articles',
      label: 'Articles',
      view: 'list',
      dataSource: 'articles',
    },
    {
      id: 'about',
      label: 'About',
      view: 'textReader',
      payload: { title: 'About', text: ABOUT_TEXT },
    },
    {
      id: 'extras',
      label: 'Misc',
      view: 'splitMenu',
      children: [
        {
          id: 'extras.photos',
          label: 'Photos',
          view: 'coverflow',
          dataSource: 'photos',
          previewImage: '/media/images/home/main.webp',
        },
        {
          id: 'extras.kitchen',
          label: 'Kitchen Wins',
          view: 'coverflow',
          dataSource: 'kitchen',
          previewImage: '/media/images/contact/pizza.webp',
        },
        {
          id: 'extras.concerts',
          label: 'Concerts Seen',
          view: 'list',
          dataSource: 'concerts',
          groupBy: 'year',
        },
        {
          id: 'extras.list',
          label: 'List',
          view: 'list',
          dataSource: 'list',
        },
        {
          id: 'extras.tweets',
          label: 'pennguytweets',
          view: 'list',
          dataSource: 'tweets',
        },
        {
          id: 'extras.links',
          label: 'Links',
          view: 'list',
          dataSource: 'links',
        },
        {
          id: 'extras.wifi',
          label: 'Amusing Wi-Fi Names',
          view: 'list',
          dataSource: 'wifi',
        },
        {
          id: 'extras.settings',
          label: 'Settings',
          view: 'settings',
        },
      ],
    },
  ],
};

const index = new Map<string, MenuNode>();
function walk(node: MenuNode) {
  index.set(node.id, node);
  node.children?.forEach(walk);
}
walk(menuTree);

export function findNode(id: string): MenuNode | undefined {
  return index.get(id);
}

export function allNodes(): MenuNode[] {
  return [...index.values()];
}
