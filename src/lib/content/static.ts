/**
 * Content that lives in code rather than the database, shared by every view
 * (main site, iPod, iTunes) so a change here shows up in all three. Each view
 * still decides how to present it; only the words and the picture are shared.
 *
 * The per-view "About" texts are deliberately NOT here: they explain how to
 * use that particular view.
 */
export interface StaticPhoto {
  title: string;
  imagePath: string;
  text: string;
}

export const OCTAVIUM_TEXT =
  "Octavium was my college band, where I played the bass. It was quite a ride, from playing in and winning band competitions, to writing original songs, to even performing at the Hard Rock Cafe!";

export const OCTAVIUM: StaticPhoto = {
  title: 'Octavium',
  imagePath: '/media/images/music/Octavium.webp',
  text: OCTAVIUM_TEXT,
};

export const VINYLS: StaticPhoto = {
  title: 'Vinyls',
  imagePath: '/media/images/travel/vinyls.webp',
  text: 'The vinyl shelf.',
};

export const MAGNETS: StaticPhoto = {
  title: 'Fridge Magnets',
  imagePath: '/media/images/travel/fridge-magnets.webp',
  text: 'Magnets from everywhere.',
};
