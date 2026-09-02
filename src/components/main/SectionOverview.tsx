import Link from 'next/link';
import type { SectionDef } from '@/lib/main/routes';
import Picture from './Picture';

/** Cards for every page in a section; optional image per href. */
export default function SectionOverview({ section, images = {} }: { section: SectionDef; images?: Record<string, { src: string; alt: string; portrait?: boolean }> }) {
  return (
    <div className="grid grid-3">
      {section.pages.map((p) => {
        const img = images[p.href];
        return (
          <Link key={p.href} href={p.href} className="card">
            {img && (
              <div className={`card-media ${img.portrait ? 'portrait' : ''}`}>
                <Picture src={img.src} alt={img.alt} sizes="(min-width: 900px) 360px, 100vw" />
              </div>
            )}
            <div className="card-body">
              <h3>{p.label}</h3>
              <p>{p.blurb}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
