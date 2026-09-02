import Link from 'next/link';

/** Title block with an optional eyebrow link back to the section. */
export default function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: { label: string; href: string }; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      {eyebrow && (
        <p className="eyebrow">
          <Link href={eyebrow.href}>{eyebrow.label}</Link>
        </p>
      )}
      <h1>{title}</h1>
      {intro && <p>{intro}</p>}
      {children}
    </header>
  );
}
