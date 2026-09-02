import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { ABOUT, SOCIALS } from '@/content/site';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Professional' };
export const dynamic = 'force-dynamic';

export default async function ProfessionalPage() {
  const jobs = await getSection('timeline');
  const linkedin = SOCIALS.find((s) => s.id === 'linkedin');
  return (
    <>
      <PageHeader eyebrow={{ label: 'About', href: '/about' }} title="Professional" intro={ABOUT.professionalIntro}>
        {linkedin && (
          <a className="btn btn-sm" href={linkedin.url} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
      </PageHeader>
      <ul className="timeline" data-testid="timeline">
        {jobs.map((j) => (
          <li key={j.id} id={`job-${j.id}`}>
            <h3>
              {j.role} <span className="muted" style={{ fontWeight: 400 }}>at {j.company}</span>
            </h3>
            <p className="when">
              {j.dates}
              {j.location && ` / ${j.location}`}
            </p>
            {j.description && <p>{j.description}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
