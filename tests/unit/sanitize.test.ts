import { describe, expect, it } from 'vitest';
import { sanitizeArticleHtml } from '@/lib/content/sanitize';

describe('sanitizeArticleHtml', () => {
  it('keeps article markup and makes links safe', () => {
    const out = sanitizeArticleHtml('<h2>Hi</h2><p>Some <em>text</em> and <a href="https://x.test/p">a link</a>.</p>');
    expect(out).toContain('<h2>Hi</h2>');
    expect(out).toContain('<em>text</em>');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('strips scripts, event handlers, iframes, styles and javascript: URLs', () => {
    const out = sanitizeArticleHtml(
      '<p onclick="x()">a</p><script>alert(1)</script><iframe src="https://evil"></iframe><style>p{}</style><a href="javascript:alert(1)">b</a><img src="data:image/png;base64,AAAA">',
    );
    expect(out).not.toMatch(/script|iframe|style|onclick|javascript:|data:/i);
    expect(out).toContain('<p>a</p>');
  });

  it('lazy-loads images and only allows http(s) sources', () => {
    const out = sanitizeArticleHtml('<img src="https://cdn.test/a.jpg" alt="a"><img src="ftp://x/b.jpg">');
    expect(out).toContain('src="https://cdn.test/a.jpg"');
    expect(out).toContain('loading="lazy"');
    expect(out).not.toContain('ftp://');
  });
});
