import Link from 'next/link';
import Hero, { type HeroImage } from '@/components/main/Hero';
import Mosaic, { type MosaicImage } from '@/components/main/Mosaic';
import { pictureData } from '@/components/main/Picture';
import ViewCards from '@/components/main/ViewCards';
import { HOME } from '@/content/site';
import { getSection, listArticles, listYoutube } from '@/lib/content/queries';
import { SECTIONS } from '@/lib/main/routes';
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
  const [siteConfig, photos, guitars, kitchen, alison, articles, videos, ugg] = await Promise.all([
    siteConfigFromRequest(),
    getSection('photos'),
    getSection('guitars'),
    getSection('kitchen'),
    getSection('alison'),
    listArticles(),
    listYoutube(),
    getSection('ugg'),
  ]);

  const heroImages: HeroImage[] = photos.map((p) => ({ ...pictureData(p.imagePath), alt: p.description || p.title, caption: p.title }));
  const mosaic: MosaicImage[] = interleave(
    sample(guitars.slice(1), 8).map((g) => ({ ...pictureData(g.imagePath), alt: g.name, href: '/music/guitars' })),
    sample(kitchen, 8).map((k) => ({ ...pictureData(k.imagePath), alt: k.title, href: '/collections/kitchen-wins' })),
    sample(alison, 8).map((a) => ({ ...pictureData(a.imagePath), alt: `, `, href: '/collections/alison' })),
  );
  const latestArticle = articles[0];
  const latestVideo = videos[0];
  const latestEpisode = ugg[0];

  return (
    <>
      <Hero images={heroImages}>
        <h1>{HOME.greeting}</h1>
        <p>{HOME.intro}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/music">
            Start with the music
          </Link>
          <Link className="btn" href="/about">
            About me
          </Link>
        </div>
      </Hero>

      <section className="section">
        <p className="lead">{HOME.lead}</p>
      </section>

      <section className="section" aria-labelledby="explore">
        <div className="section-head">
          <h2 id="explore">{HOME.exploreHeading}</h2>
        </div>
        <div className="grid grid-3">
          {SECTIONS.map((s) => (
            <Link key={s.id} href={s.href} className="card">
              <div className="card-body">
                <h3>{s.label}</h3>
                <p>{s.blurb}</p>
                <p style={{ marginTop: '0.6rem', fontSize: '0.88rem' }}>{s.pages.map((p) => p.label).join(' / ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="latest">
        <div className="section-head">
          <h2 id="latest">{HOME.latestHeading}</h2>
        </div>
        <div className="grid grid-3">
          {latestArticle && (
            <Link href={`/collections/articles/${latestArticle.slug}`} className="latest-card">
              <span>Newest article</span>
              <strong>{latestArticle.title}</strong>
              <span>{latestArticle.publishedLabel}</span>
            </Link>
          )}
          {latestVideo && (
            <Link href={`/music/youtube#yt-${latestVideo.videoId}`} className="latest-card">
              <span>Newest video</span>
              <strong>{latestVideo.title}</strong>
              <span>{latestVideo.publishedAt.slice(0, 10)}</span>
            </Link>
          )}
          {latestEpisode && (
            <Link href={`/music/instagram?year=${latestEpisode.year}#ugg-${latestEpisode.episode}`} className="latest-card">
              <span>Newest UGG Chronicles episode</span>
              <strong>
                Ep. {latestEpisode.episode}: {latestEpisode.name}
              </strong>
              <span>{latestEpisode.postedAt.slice(0, 10)}</span>
            </Link>
          )}
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
