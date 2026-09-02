import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Amusing Wi-Fi Names' };
export const dynamic = 'force-dynamic';

export default async function WifiPage() {
  const names = await getSection('wifi');
  return (
    <>
      <PageHeader eyebrow="Misc" title="Amusing Wi-Fi Names" intro="Spotted in the wild, written down before they scrolled away." />
      <ul className="list-plain" style={{ maxWidth: 560 }}>
        {names.map((n) => (
          <li key={n.id} id={`wifi-${n.id}`} className="row">
            <span className="row-title" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 400 }}>
              {n.name}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
