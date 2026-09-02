import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'List' };
export const dynamic = 'force-dynamic';

const GROUPS = [
  { key: 'ruining', label: 'Americans taking a good thing and ruining it' },
  { key: 'right', label: 'Americans doing things right' },
] as const;

export default async function ListPage() {
  const items = await getSection('list');
  return (
    <>
      <PageHeader eyebrow={{ label: 'Misc', href: '/misc' }} title="List" intro="Two lists, kept since moving to the States." />
      {GROUPS.map((g) => (
        <section key={g.key} className="section" style={{ marginBlock: '2rem' }}>
          <h2>{g.label}</h2>
          <ol>
            {items
              .filter((i) => i.category === g.key)
              .map((i) => (
                <li key={i.id} id={`list-${i.id}`} style={{ padding: '0.25rem 0' }}>
                  {i.name}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </>
  );
}
