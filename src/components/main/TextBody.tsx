/**
 * Renders the plain-text bodies used by recipes and spice blends exactly as
 * authored: blank lines separate paragraphs, consecutive "- " lines become a
 * list, and single newlines inside a paragraph become line breaks.
 */
export default function TextBody({ text, className = 'prose' }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\s*[-*]\s+/, '')}</li>
              ))}
            </ul>
          );
        }
        const heading = lines.length === 1 && /^(Part \d+|Step \d+|Ingredients|Method|Notes?)\b.*:?$/i.test(block.trim());
        if (heading) return <h3 key={i}>{block.trim().replace(/:$/, '')}</h3>;
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {l}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
