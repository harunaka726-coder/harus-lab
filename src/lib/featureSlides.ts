import fs from 'node:fs';
import path from 'node:path';
import { brandMarkForSlug } from '../config/brandMarks';

export type FeatureSlide = {
  slug: string;
  src: string;
  placeholder: boolean;
  mark: string;
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
        mark: brandMarkForSlug(slug),
      };
    }
  }
  return {
    slug,
    src: `/featuregraphic/${slug}.svg`,
    placeholder: true,
    mark: brandMarkForSlug(slug),
  };
}

/** Build slideshow entries in the same order as featured Works. */
export function getFeatureSlidesForSlugs(slugs: string[]): FeatureSlide[] {
  return slugs.map(featureImageForSlug);
}
