import fs from 'node:fs';
import path from 'node:path';

/**
 * Keystatic stores secondary markdoc fields as:
 *   src/content/works/{slug}/contentEn.mdoc
 * (not in the main entry frontmatter)
 */
export function loadWorkContentEn(slug: string, frontmatterFallback?: string): string {
  const file = path.resolve('src/content/works', slug, 'contentEn.mdoc');
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, 'utf8');
    const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();
    if (body) return body;
  }
  return frontmatterFallback?.trim() || '';
}
