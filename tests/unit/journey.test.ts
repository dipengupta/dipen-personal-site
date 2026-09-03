import { describe, expect, it } from 'vitest';
import { buildJourney, parseStart, startYearLabel } from '@/lib/main/journey';

describe('parseStart', () => {
  it('reads the first date of an authored span', () => {
    expect(parseStart("Feb '25 - Present")).toBe(2025 * 12 + 1);
    expect(parseStart("Aug '15 - May '19")).toBe(2015 * 12 + 7);
    // The seed writes September as "Sept".
    expect(parseStart("Sept '21 - May '23")).toBe(2021 * 12 + 8);
    // A bare year counts as January.
    expect(parseStart("'03")).toBe(2003 * 12);
    expect(parseStart('someday')).toBeNull();
  });

  it('labels the marker with the starting year', () => {
    expect(startYearLabel("Jun '23 - Feb '25")).toBe("'23");
    expect(startYearLabel('')).toBe('');
  });
});

describe('buildJourney', () => {
  const jobs = [
    { id: 1, role: 'Software Developer', company: 'URL', dates: "Feb '25 - Present", location: 'Harrisburg, PA', description: 'Commissions.' },
    { id: 2, role: 'Grader', company: 'Penn State', dates: "Sept '21 - May '23", location: '', description: '' },
    { id: 3, role: 'Engineer', company: 'Amadeus', dates: "Jul '19 - Jun '21", location: '', description: '' },
  ];
  const schools = [
    { id: 1, school: 'Penn State Harrisburg', degree: 'MS in Computer Science', dates: "Aug '21 - May '23" },
    { id: 2, school: 'KJSCE, Mumbai', degree: 'B.Tech in Information Technology', dates: "Aug '15 - May '19" },
  ];

  it('interleaves both lists newest first and tags each side', () => {
    const entries = buildJourney(jobs, schools);
    expect(entries.map((e) => e.id)).toEqual(['job-1', 'job-2', 'education-1', 'job-3', 'education-2']);
    expect(entries.map((e) => e.kind)).toEqual(['work', 'work', 'education', 'work', 'education']);
  });

  it('carries the fields each side renders', () => {
    const [first, , school] = buildJourney(jobs, schools);
    expect(first).toMatchObject({ title: 'Software Developer', org: 'URL', location: 'Harrisburg, PA', yearLabel: "'25" });
    expect(school).toMatchObject({ title: 'MS in Computer Science', org: 'Penn State Harrisburg', location: '', description: '' });
  });

  it('sorts undated entries last without dropping them', () => {
    const entries = buildJourney([{ id: 9, role: 'Volunteer', company: 'Somewhere', dates: '', location: '', description: '' }], schools);
    expect(entries).toHaveLength(3);
    expect(entries.at(-1)?.id).toBe('job-9');
  });
});
