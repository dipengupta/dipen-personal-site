import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import TweetFeed from '@/components/main/TweetFeed';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'pennguytweets' };
export const dynamic = 'force-dynamic';

export default async function TweetsPage() {
  const tweets = await getSection('tweets');
  return (
    <>
      <PageHeader eyebrow={{ label: 'Collections', href: '/collections' }} title="pennguytweets" intro={`The @20swithepennguy archive: ${tweets.length} numbered thoughts, newest first.`}>
        <a className="btn btn-sm" href="https://x.com/20swithepennguy" target="_blank" rel="noopener noreferrer">
          Follow on X
        </a>
      </PageHeader>
      <TweetFeed handle="@20swithepennguy" tweets={tweets.map((t) => ({ number: t.number, text: t.text, date: t.postedAt, url: t.url }))} />
    </>
  );
}
