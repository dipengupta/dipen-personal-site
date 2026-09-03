import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { ABOUT, SOCIALS } from '@/content/site';
import { getSection } from '@/lib/content/queries';
import { buildJourney } from '@/lib/main/journey';

export const metadata: Metadata = { title: 'Journey' };
export const dynamic = 'force-dynamic';

export default async function JourneyPage() {
  const [jobs, education] = await Promise.all([getSection('timeline'), getSection('education')]);
  const entries = buildJourney(jobs, education);
  const linkedin = SOCIALS.find((s) => s.id === 'linkedin');
  const label = { work: ABOUT.journeyWorkLabel, education: ABOUT.journeyEducationLabel };
  return (
    <>
      <PageHeader eyebrow="About" title="Journey" intro={ABOUT.journeyIntro}>
        <p className="jtl-key">
          <span className="jtl-key-work">{label.work}</span>
          <span className="jtl-key-education">{label.education}</span>
        </p>
        {linkedin && (
          <a className="btn btn-sm" href={linkedin.url} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
      </PageHeader>
      <ol className="jtl" data-testid="journey">
        {entries.map((e) => (
          <li key={e.id} className={`jtl-item jtl-${e.kind}`}>
            <span className="jtl-year" aria-hidden="true">
              {e.yearLabel}
            </span>
            <div id={e.id} className="jtl-head">
              <p className="jtl-kind">{label[e.kind]}</p>
              <h2>{e.title}</h2>
              <p className="jtl-org">{e.org}</p>
            </div>
            <div className="jtl-aside">
              <p className="when">
                {e.dates}
                {e.location && ` / ${e.location}`}
              </p>
              {e.description && <p className="jtl-body">{e.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
