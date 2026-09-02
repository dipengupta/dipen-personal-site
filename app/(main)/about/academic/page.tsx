import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import TextBody from '@/components/main/TextBody';
import { ABOUT } from '@/content/site';
import { getSection } from '@/lib/content/queries';
import { siteConfigFromRequest } from '@/lib/site/request';
import { viewHref } from '@/lib/site/views';

export const metadata: Metadata = { title: 'Academic' };
export const dynamic = 'force-dynamic';

export default async function AcademicPage() {
  const [siteConfig, projects, education] = await Promise.all([siteConfigFromRequest(), getSection('projects'), getSection('education')]);
  return (
    <>
      <PageHeader eyebrow={{ label: 'About', href: '/about' }} title="Academic" intro={ABOUT.academicBlurb} />
      <section className="section" aria-labelledby="projects">
        <div className="section-head">
          <h2 id="projects">{ABOUT.projectsHeading}</h2>
        </div>
        <p className="muted">{ABOUT.projectsIntro}</p>
        <div className="projects">
          {projects.map((p) => (
            <article key={p.id} id={`project-${p.id}`} className="project">
              <div>
                <h3>{p.title}</h3>
                {p.subtitle && <p className="muted" style={{ marginBottom: '0.2rem' }}>{p.subtitle}</p>}
                <p className="muted" style={{ fontSize: '0.9rem' }}>{p.dates}</p>
                <TextBody text={p.description} className="project-body" />
                {p.links.length > 0 && (
                  <p className="pill-row" style={{ marginTop: '0.8rem' }}>
                    {p.links.map((l) =>
                      l.view ? (
                        <a key={l.label} className="pill" href={viewHref(l.view, siteConfig)}>
                          {l.label}
                        </a>
                      ) : (
                        <a key={l.label} className="pill" href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label}
                        </a>
                      ),
                    )}
                  </p>
                )}
              </div>
              {p.imagePath && <Picture src={p.imagePath} alt={p.title} sizes="(min-width: 900px) 360px, 100vw" style={{ borderRadius: 'var(--radius-sm)' }} />}
            </article>
          ))}
        </div>
      </section>
      <section className="section" aria-labelledby="education">
        <div className="section-head">
          <h2 id="education">{ABOUT.educationHeading}</h2>
        </div>
        <p className="muted">{ABOUT.educationIntro}</p>
        <ul className="timeline">
          {education.map((e) => (
            <li key={e.id} id={`education-${e.id}`}>
              <h3>{e.degree}</h3>
              <p className="when">{e.dates}</p>
              <p>{e.school}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
