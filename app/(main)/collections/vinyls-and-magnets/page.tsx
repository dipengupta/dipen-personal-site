import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import { MAGNETS, VINYLS } from '@/lib/content/static';

export const metadata: Metadata = { title: 'Vinyls and Fridge Magnets' };

export default function VinylsAndMagnetsPage() {
  return (
    <>
      <PageHeader eyebrow={{ label: 'Collections', href: '/collections' }} title="Vinyls and Fridge Magnets" />
      {[VINYLS, MAGNETS].map((s) => (
        <section key={s.title} className="section static-photo" id={s.title === 'Vinyls' ? 'vinyls' : 'magnets'}>
          <Picture src={s.imagePath} alt={s.title} sizes="(min-width: 900px) 660px, 100vw" />
          <div>
            <h2>{s.title}</h2>
            <p className="lead">{s.text}</p>
          </div>
        </section>
      ))}
    </>
  );
}
