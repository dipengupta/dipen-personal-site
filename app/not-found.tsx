import Link from 'next/link';

/** Global 404 for URLs that match no route in any view. */
export default function NotFound() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1.5rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>That URL does not seem to be right</h1>
      <p>
        <Link href="/">Back to the front page</Link>
      </p>
    </main>
  );
}
