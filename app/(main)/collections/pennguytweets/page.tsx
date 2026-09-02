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
      <PageHeader eyebrow="Collections" title="pennguytweets" />
      <TweetFeed handle="@20swithepennguy" tweets={tweets.map((t) => ({ number: t.number, text: t.text, date: t.postedAt, url: t.url }))} />
    </>
  );
}
