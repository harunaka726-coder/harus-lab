import fs from 'node:fs';
import path from 'node:path';
import type { Lang } from '../i18n/ui';

const fieldByLang: Record<Exclude<Lang, 'ja'>, string> = {
  en: 'contentEn',
  es: 'contentEs',
  zh: 'contentZh',
};

/**
 * Keystatic stores secondary markdoc fields as:
 *   src/content/works/{slug}/contentEn.mdoc (etc.)
 */
export function loadWorkContentLocale(
  slug: string,
  lang: Lang,
  frontmatterFallback?: string,
): string {
  if (lang === 'ja') return '';
  const field = fieldByLang[lang];
  const file = path.resolve('src/content/works', slug, `${field}.mdoc`);
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, 'utf8');
    const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();
    if (body) return body;
  }
  return frontmatterFallback?.trim() || '';
}
