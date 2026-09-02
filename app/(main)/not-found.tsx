import Link from 'next/link';

/** 404 inside the main site (unknown article, recipe, or any unmatched URL). */
export default function NotFound() {
  return (
    <main style={{ padding: '4rem 1.5rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>That URL does not seem to be right</h1>
      <p>
        <Link href="/">Back to the front page</Link>
      </p>
    </main>
  );
}
