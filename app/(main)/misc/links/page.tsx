import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Links' };
export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  const links = await getSection('links');
  return (
    <>
      <PageHeader eyebrow={{ label: 'Misc', href: '/misc' }} title="Links" intro="Elsewhere on the internet." />
      <ul className="list-plain" style={{ maxWidth: 560 }}>
        {links.map((l) => (
          <li key={l.id} id={`link-${l.id}`} className="row">
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="row-title">
              {l.label}
            </a>
            <span className="row-meta">{new URL(l.url).hostname.replace(/^www\./, '')}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
