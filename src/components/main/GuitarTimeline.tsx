import Picture from './Picture';

export interface GuitarEntry {
  id: number;
  name: string;
  year: string;
  imagePath: string;
  description: string;
}

/**
 * The guitars as a vertical timeline, newest first: a line down the middle,
 * one big photo per guitar with its story, alternating left and right the
 * way the Professional page reads. Stacks into a single column on phones.
 */
export default function GuitarTimeline({ guitars }: { guitars: GuitarEntry[] }) {
  return (
    <ol className="gtl" data-testid="guitar-timeline">
      {guitars.map((g, i) => (
        <li key={g.id} id={`guitar-${g.id}`} className={`gtl-item ${i % 2 === 0 ? 'gtl-left' : 'gtl-right'}`}>
          <span className="gtl-year" aria-hidden="true">
            {g.year}
          </span>
          <figure className="gtl-figure">
            <Picture src={g.imagePath} alt={g.name} sizes="(min-width: 900px) 520px, 100vw" priority={i < 2} />
            <figcaption>
              <h2>
                {g.name} <span className="muted">{g.year}</span>
              </h2>
              <p>{g.description}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ol>
  );
}
