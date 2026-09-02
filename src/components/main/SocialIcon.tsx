/** Small inline SVG glyphs for the footer's social links (no icon font, no emoji). */
export default function SocialIcon({ id }: { id: string }) {
  const common = { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const };
  switch (id) {
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.8 15.1V8.9l6 3.1-6 3.1z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'soundcloud':
      return (
        <svg {...common}>
          <path d="M2 14h1.5v4H2zm2.5-2H6v6H4.5zm2.5-1.5h1.5V18H7zm2.5-2H11v9.5H9.5zM12 7.5c.5-.3 1.2-.5 2-.5a4.5 4.5 0 0 1 4.5 4.2A3 3 0 0 1 19 11a3.5 3.5 0 0 1 0 7h-7z" />
        </svg>
      );
    case 'substack':
      return (
        <svg {...common}>
          <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h16v8l-8-4.5L4 20z" />
        </svg>
      );
    case 'medium':
      return (
        <svg {...common}>
          <circle cx="7" cy="12" r="5" />
          <ellipse cx="16" cy="12" r="2.5" ry="5" />
          <rect x="20.5" y="7.5" width="1.5" height="9" />
        </svg>
      );
    case 'github':
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.2-.2-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.9-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          <path d="M4.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 9h3v12H3zm6 0h2.9v1.7c.4-.8 1.5-1.9 3.4-1.9 3.6 0 4.2 2.4 4.2 5.4V21h-3v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.5L4.6 21h-3l7.5-8.6L1.3 3h6.6l4.5 6z" />
        </svg>
      );
    case 'threads':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21c-5 0-8-3.5-8-9s3-9 8-9c4 0 6.5 2 7.3 5M12 12.5c3-.5 5.5.5 5.5 3s-2.5 3.5-5 3.5-4-1.2-4-3 1.5-3 4-3 4 .6 4.5 2" />
        </svg>
      );
    default:
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
  }
}
