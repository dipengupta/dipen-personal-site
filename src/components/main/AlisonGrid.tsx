'use client';

import { useState } from 'react';
import PhotoGrid, { type PhotoItem } from './PhotoGrid';
import Segmented from './Segmented';

/**
 * The Alison collection in two halves. Most of the run is plain pictures of
 * her, captioned with the month they were taken, and laid out on one even 3:4
 * grid. The rest are story frames with a quote sitting on the image as pixels:
 * those carry their own caption already, so the switch shows them without the
 * month and year, and at their own 9:16 shape so no crop eats into the text.
 */
export default function AlisonGrid({ photos, quotes }: { photos: PhotoItem[]; quotes: PhotoItem[] }) {
  const [mode, setMode] = useState<'photos' | 'quotes'>('photos');
  return (
    <>
      <Segmented
        label="View"
        value={mode}
        onSelect={setMode}
        options={[
          { value: 'photos', label: 'Photos' },
          { value: 'quotes', label: 'Quotes' },
        ]}
      />
      <PhotoGrid
        key={mode}
        items={mode === 'photos' ? photos : quotes}
        size="sm"
        sizes="(min-width: 900px) 180px, 33vw"
        fit={mode === 'photos' ? 'portrait' : 'natural'}
      />
    </>
  );
}
