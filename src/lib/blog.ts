import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Post = CollectionEntry<'blog'>;

export async function getPostsSorted() {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postTitle(post: Post, lang: Lang) {
  if (lang === 'en' && post.data.titleEn) return post.data.titleEn;
  if (lang === 'es') return post.data.titleEs || post.data.titleEn || post.data.title;
  if (lang === 'zh') return post.data.titleZh || post.data.titleEn || post.data.title;
  return post.data.title;
}

export function postExcerpt(post: Post, lang: Lang) {
  if (lang === 'en' && post.data.excerptEn) return post.data.excerptEn;
  if (lang === 'es') return post.data.excerptEs || post.data.excerptEn || post.data.excerpt;
  if (lang === 'zh') return post.data.excerptZh || post.data.excerptEn || post.data.excerpt;
  return post.data.excerpt;
}

export function postPathId(post: Post) {
  return post.id.replace(/\.(md|mdoc)$/, '');
}
