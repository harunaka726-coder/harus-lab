import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { t } from '../i18n/ui';

export type Work = CollectionEntry<'works'>;

export async function getWorksSorted() {
  const works = await getCollection('works');
  return works.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedWorks() {
  return (await getWorksSorted()).filter((w) => w.data.gallery === 'featured');
}

export async function getOtherWorks() {
  return (await getWorksSorted()).filter((w) => w.data.gallery !== 'featured');
}

function publicAsset(assetPath: string, fallbackDir: string) {
  if (assetPath.startsWith('/') || assetPath.startsWith('http')) return assetPath;
  return `${fallbackDir}/${assetPath}`.replace(/\/{2,}/g, '/');
}

export function workIcon(work: Work) {
  if (work.data.icon) return publicAsset(work.data.icon, '/icons');
  return `/icons/${workPathId(work)}.png`;
}

const SHOT_SKIP = /feature|header|search|icon|preview-|_raw-|aab$|apk$/i;

function listShotFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(png|jpe?g|webp)$/i.test(e.name) && !SHOT_SKIP.test(e.name))
    .map((e) => e.name)
    .sort();
}

/**
 * Locale Play screenshots under public/works/{slug}/{lang}/.
 * Fallback for missing locales: en → ja → root (web services).
 * es/zh prefer English assets when that locale folder is empty.
 */
export function workScreenshots(work: Work, lang: Lang = 'ja') {
  const slug = workPathId(work);
  const listFrom = (locale: string) => {
    const dir = path.resolve('public/works', slug, locale);
    return listShotFiles(dir).map((f) => `/works/${slug}/${locale}/${f}`);
  };
  const rootList = () => {
    const dir = path.resolve('public/works', slug);
    return listShotFiles(dir).map((f) => `/works/${slug}/${f}`);
  };

  const localized = listFrom(lang);
  if (localized.length) return localized;

  if (lang === 'es' || lang === 'zh') {
    const en = listFrom('en');
    if (en.length) return en;
  }
  if (lang !== 'ja') {
    const ja = listFrom('ja');
    if (ja.length) return ja;
  }
  if (lang === 'ja') {
    const en = listFrom('en');
    if (en.length) return en;
  }

  const root = rootList();
  if (root.length) return root;

  return (work.data.screenshots ?? []).map((src) => publicAsset(src, '/screenshots'));
}

export function workTitle(work: Work, lang: Lang) {
  if (lang === 'en') return work.data.titleEn || work.data.title;
  if (lang === 'es') return work.data.titleEs || work.data.titleEn || work.data.title;
  if (lang === 'zh') return work.data.titleZh || work.data.titleEn || work.data.title;
  return work.data.title;
}

/** Compact label for prev/next pager (avoids overflow on mobile). */
export function workPagerTitle(work: Work, lang: Lang) {
  const id = workPathId(work);
  if (id === 'goo-choki-paa') {
    if (lang === 'ja') return 'グーチョキパー';
    if (lang === 'zh') return '剪刀石头布';
    if (lang === 'es') return 'Piedra, papel…';
    return 'RPS Simulator';
  }
  return workTitle(work, lang);
}

export function workSummary(work: Work, lang: Lang) {
  if (lang === 'en') return work.data.summaryEn || work.data.summary;
  if (lang === 'es') return work.data.summaryEs || work.data.summaryEn || work.data.summary;
  if (lang === 'zh') return work.data.summaryZh || work.data.summaryEn || work.data.summary;
  return work.data.summary;
}

export function statusLabel(lang: Lang, status: Work['data']['status']) {
  if (status === 'released') return t(lang, 'statusReleased');
  if (status === 'preview') return t(lang, 'statusPreview');
  return t(lang, 'statusWip');
}

export function categoryLabel(lang: Lang, category: Work['data']['category']) {
  if (category === 'life') return t(lang, 'categoryLife');
  if (category === 'map') return t(lang, 'categoryMap');
  if (category === 'creative') return t(lang, 'categoryCreative');
  return t(lang, 'categoryPlay');
}

export function workPathId(work: Work) {
  return work.id.replace(/\.(md|mdoc)$/, '');
}

/** 4 screenshots → 2 cols; otherwise 3 per row. */
export function resolveImageColumns(_work: Work, shotCount: number): 1 | 2 | 3 {
  if (shotCount === 4) return 2;
  if (shotCount <= 1) return 1;
  return 3;
}

/** @deprecated use resolveImageColumns */
export function workImageColumns(work: Work): 1 | 2 | 3 {
  return resolveImageColumns(work, 0) === 1 ? 1 : 2;
}

export async function getWorkNeighbors(work: Work) {
  const works = await getWorksSorted();
  const id = workPathId(work);
  const idx = works.findIndex((w) => workPathId(w) === id);
  if (idx < 0) return { prev: null, next: null };
  const prev = works[(idx - 1 + works.length) % works.length] ?? null;
  const next = works[(idx + 1) % works.length] ?? null;
  return { prev, next };
}
