import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import SocialIcon from '@/components/main/SocialIcon';
import { ABOUT, CONTACT, SOCIALS } from '@/content/site';
import { sectionById } from '@/lib/main/routes';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  const section = sectionById('about');
  return (
    <>
      <PageHeader title={ABOUT.heading} />
      <div className="static-photo">
        <div>
          <p className="lead">{ABOUT.intro}</p>
          <div className="grid" style={{ marginTop: '2rem' }}>
            {section.pages.map((p) => (
              <Link key={p.href} href={p.href} className="card">
                <div className="card-body">
                  <h3>{p.label}</h3>
                  <p>{p.href.endsWith('academic') ? ABOUT.academicBlurb : ABOUT.professionalBlurb}</p>
                </div>
              </Link>
            ))}
          </div>
          <section className="section" id="contact">
            <h2>{CONTACT.heading}</h2>
            <p>{CONTACT.body}</p>
            <ul className="list-plain">
              {CONTACT.emails.map((e) => (
                <li key={e}>
                  <a href={`mailto:${e}`}>{e}</a>
                </li>
              ))}
            </ul>
            <div className="socials" style={{ marginTop: '1rem' }}>
              {SOCIALS.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
                  <SocialIcon id={s.id} />
                  {s.label}
                </a>
              ))}
            </div>
          </section>
        </div>
        <Picture src="/media/images/home/prof_guitar.webp" alt="Dipen with a guitar" priority sizes="(min-width: 900px) 440px, 100vw" style={{ borderRadius: 'var(--radius)' }} />
      </div>
    </>
  );
}
