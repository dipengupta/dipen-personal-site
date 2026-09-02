import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import { spiceBlendsWithSlugs } from '@/lib/main/recipes';

export const metadata: Metadata = { title: 'Spice Blends' };
export const dynamic = 'force-dynamic';

export default async function SpiceBlendsPage() {
  const blends = await spiceBlendsWithSlugs();
  return (
    <>
      <PageHeader eyebrow={{ label: 'Collections', href: '/collections' }} title="Spice Blends" intro="Blends and marinades worth keeping on hand." />
      <div className="grid">
        {blends.map((b) => (
          <Link key={b.id} id={`spice-${b.id}`} href={`/collections/spice-blends/${b.slug}`} className="card">
            <div className="card-body">
              <h3>{b.title}</h3>
              <p>{b.body.split('\n')[0].slice(0, 110)}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
