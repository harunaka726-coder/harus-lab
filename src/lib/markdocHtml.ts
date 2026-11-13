import Markdoc from '@markdoc/markdoc';

/** Turn 「・」「•」 bullet lines into markdown lists so they render with line breaks. */
export function normalizeBulletLines(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (/^[・•]\s*\S/.test(lines[i])) {
      while (i < lines.length && /^[・•]\s*\S/.test(lines[i])) {
        out.push(`- ${lines[i].replace(/^[・•]\s*/, '')}`);
        i++;
      }
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}

/** Strip markdown images — screenshots are rendered by the page template. */
export function stripMarkdownImages(source: string): string {
  return source
    .replace(/!\[[^\]]*\]\([^)]+\)\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Render a Markdoc/Markdown string (e.g. contentEn) to HTML. */
export function renderMarkdocHtml(source: string | undefined | null): string {
  if (!source?.trim()) return '';
  const cleaned = normalizeBulletLines(stripMarkdownImages(source));
  const ast = Markdoc.parse(cleaned);
  const content = Markdoc.transform(ast);
  return Markdoc.renderers.html(content);
}
