import Link from 'next/link';
import Hero, { type HeroImage } from '@/components/main/Hero';
import Mosaic, { type MosaicImage } from '@/components/main/Mosaic';
import { pictureData } from '@/components/main/Picture';
import ViewCards from '@/components/main/ViewCards';
import { HOME } from '@/content/site';
import { getSection } from '@/lib/content/queries';
import { shufflePhotos } from '@/lib/main/photos';
import { NAV_SECTIONS, sectionHref } from '@/lib/main/routes';
import { siteConfigFromRequest } from '@/lib/site/request';

export const dynamic = 'force-dynamic';

/** Every nth item of a list, so the mosaic samples each collection evenly. */
function sample<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

/** Round-robin merge so neighbouring tiles come from different collections. */
function interleave<T>(...lists: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

export default async function HomePage() {
  const [siteConfig, photos, guitars, kitchen, alison] = await Promise.all([
    siteConfigFromRequest(),
    getSection('photos'),
    getSection('guitars'),
    getSection('kitchen'),
    getSection('alison'),
  ]);

  const heroImages: HeroImage[] = shufflePhotos(photos).map((photo) => ({
    ...pictureData(photo.imagePath),
    alt: photo.title,
  }));
  const heroContent = (
    <>
      <h1>{HOME.greeting}</h1>
      <p>{HOME.intro}</p>
    </>
  );
  const mosaic: MosaicImage[] = interleave(
    sample(guitars.slice(1), 8).map((g) => ({ ...pictureData(g.imagePath), alt: g.name, href: '/music/guitars' })),
    sample(kitchen, 8).map((k) => ({ ...pictureData(k.imagePath), alt: k.title, href: '/collections/recipes' })),
    sample(alison, 8).map((a) => ({ ...pictureData(a.imagePath), alt: `${a.title}, ${a.description}`, href: '/collections/alison' })),
  );

  return (
    <>
      <Hero images={heroImages}>{heroContent}</Hero>

      <section className="section" aria-labelledby="explore">
        <div className="section-head">
          <h2 id="explore">{HOME.exploreHeading}</h2>
        </div>
        <div className="index">
          {NAV_SECTIONS.map((s) => (
            <div key={s.id} className="index-row">
              <Link href={sectionHref(s)} className="index-label">
                {s.label}
              </Link>
              <ul className="index-pages">
                {s.pages.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href}>{p.label}</Link>
                    <span className="index-blurb">{p.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="views">
        <div className="section-head">
          <h2 id="views">{HOME.viewsHeading}</h2>
        </div>
        <p className="lead">{HOME.viewsIntro}</p>
        <ViewCards siteConfig={siteConfig} />
      </section>

      <section className="section" aria-labelledby="pictures">
        <div className="section-head">
          <h2 id="pictures">{HOME.mosaicHeading}</h2>
        </div>
        <Mosaic images={mosaic} />
      </section>
    </>
  );
}
