/**
 * The Journey page merges two database sections onto one timeline: the jobs
 * in `timeline_entries` and the schools in `education`. Both store their span
 * as authored text ("Feb '25 - Present", "Aug '15 - May '19"), so the start of
 * that span is parsed here to interleave the two lists newest first. Work
 * renders on one side of the centre line, school on the other.
 */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Two-digit years in the seed all belong to this century ('03 is 2003). */
const START = /([A-Za-z]{3,})?\s*'(\d{2})\b/;

/**
 * Sortable months-since-2000 for the first date in a span, or null when the
 * text carries no year. A missing month counts as January.
 */
export function parseStart(dates: string): number | null {
  const m = START.exec(dates);
  if (!m) return null;
  const year = 2000 + Number(m[2]);
  const month = m[1] ? MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) : -1;
  return year * 12 + (month < 0 ? 0 : month);
}

/** "Feb '25 - Present" -> "'25", for the marker on the line. */
export function startYearLabel(dates: string): string {
  const m = START.exec(dates);
  return m ? `'${m[2]}` : '';
}

export type JourneyKind = 'work' | 'education';

export interface JourneyEntry {
  /** Doubles as the DOM id, so search deep links keep working. */
  id: string;
  kind: JourneyKind;
  title: string;
  org: string;
  dates: string;
  yearLabel: string;
  location: string;
  description: string;
}

interface JobRow {
  id: number;
  role: string;
  company: string;
  dates: string;
  location: string;
  description: string;
}

interface SchoolRow {
  id: number;
  school: string;
  degree: string;
  dates: string;
}

/**
 * Both lists newest first. Entries that start in the same month keep work
 * ahead of school, then their seeded order.
 */
export function buildJourney(jobs: readonly JobRow[], schools: readonly SchoolRow[]): JourneyEntry[] {
  const rows: Array<{ entry: JourneyEntry; start: number; rank: number; order: number }> = [
    ...jobs.map((j, i) => ({
      entry: {
        id: `job-${j.id}`,
        kind: 'work' as const,
        title: j.role,
        org: j.company,
        dates: j.dates,
        yearLabel: startYearLabel(j.dates),
        location: j.location,
        description: j.description,
      },
      start: parseStart(j.dates) ?? -1,
      rank: 0,
      order: i,
    })),
    ...schools.map((s, i) => ({
      entry: {
        id: `education-${s.id}`,
        kind: 'education' as const,
        title: s.degree,
        org: s.school,
        dates: s.dates,
        yearLabel: startYearLabel(s.dates),
        location: '',
        description: '',
      },
      start: parseStart(s.dates) ?? -1,
      rank: 1,
      order: i,
    })),
  ];
  rows.sort((a, b) => b.start - a.start || a.rank - b.rank || a.order - b.order);
  return rows.map((r) => r.entry);
}
