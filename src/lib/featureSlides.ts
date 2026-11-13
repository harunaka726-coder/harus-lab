import fs from 'node:fs';
import path from 'node:path';

export type FeatureSlide = {
  slug: string;
  src: string;
  placeholder: boolean;
};

export function featureImageForSlug(slug: string): FeatureSlide {
  const dir = path.resolve('public/featuregraphic');
  const candidates = [`${slug}.png`, `${slug}.jpg`, `${slug}.jpeg`, `${slug}.webp`, `${slug}.svg`];
  for (const name of candidates) {
    if (fs.existsSync(path.join(dir, name))) {
      return {
        slug,
        src: `/featuregraphic/${name}`,
        placeholder: name.endsWith('.svg'),
      };
    }
  }
  return { slug, src: `/featuregraphic/${slug}.svg`, placeholder: true };
}

/** Build slideshow entries in the same order as featured Works. */
export function getFeatureSlidesForSlugs(slugs: string[]): FeatureSlide[] {
  return slugs.map(featureImageForSlug);
}
