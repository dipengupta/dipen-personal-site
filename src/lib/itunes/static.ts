/**
 * Static content for the iTunes view. The Octavium/Vinyls/Magnets photos come
 * from the shared module (src/lib/content/static.ts) so all three views show
 * the same words; ABOUT_TEXT is deliberately iTunes-specific (the iPod has its
 * own click-wheel version and the main site its own About page).
 */
import { MAGNETS, OCTAVIUM, OCTAVIUM_TEXT, VINYLS, type StaticPhoto } from '@/lib/content/static';

export type { StaticPhoto };
export { OCTAVIUM_TEXT };

export const ABOUT_TEXT = `Hi, I'm Dipen! Welcome to Dipen's iTunes.

This is the desktop companion to my personal website, which is built as a 1:1 replica of the iPod Classic. Same content, just laid out the iTunes way: pick a section from the source list on the left.

Music has my guitars (browse them in Grid, or flip to Cover Flow with the button up top), my YouTube and Instagram videos, SoundCloud tracks, and a set of Spotify recommendations you can preview right here with the player at the top. There's also Photos, Collections (mugs, vinyls, fridge magnets, recipes), my writing, work history, and a pile of odds and ends.

Songs and previews play through the transport controls at the top; videos play inline. Want the full handheld experience instead? Click "Dipen's iPod" under Devices to switch over to the iPod itself, or "Dipen's Website" for the regular site.

Everything in here is real, built with Next.js, SQLite and a lot of CSS!

Want to say hi? I'm at dipenrgupta@icloud.com.

Dipen :)`;

export const OCTAVIUM_PHOTO: StaticPhoto = OCTAVIUM;
export const VINYLS_PHOTO: StaticPhoto = VINYLS;
export const MAGNETS_PHOTO: StaticPhoto = MAGNETS;
