'use client';

import type { CSSProperties } from 'react';

/**
 * A switch: one rounded track, a thumb that slides under whichever option is
 * chosen. The thumb is sized and placed from `--segmented-count` and
 * `--segmented-index`, so the only thing that moves is a transform.
 *
 * `onSelect` fires on every click, including one on the option already
 * chosen, which lets a caller treat a repeat click as "do it again"
 * (pennguytweets reshuffles that way).
 */
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onSelect: (value: T) => void;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      className="segmented"
      role="group"
      aria-label={label}
      data-value={value}
      style={{ '--segmented-count': options.length, '--segmented-index': index } as CSSProperties}
    >
      <span className="segmented-thumb" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="segmented-option"
          aria-current={option.value === value || undefined}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
