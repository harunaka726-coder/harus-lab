/**
 * Apostrophe (`'`) color per featured slide.
 * Source: docs/apostrophecolor.pptx (TQC → GCP, left to right).
 */
export const brandMarkBySlug: Record<string, string> = {
  'time-capsule-quiz': '#D85A3A',
  shinkanji: '#FFE866',
  mirrornote: '#9A9590',
  appup: '#E8BAC6',
  'appup-home': '#B7C9B0',
  'appup-flow': '#ADD8E6',
  'annoying-ninja': '#101010',
  'mens-cycle': '#E08520',
  logroom: '#738365',
  'goo-choki-paa': '#8E8A86',
  henohenomoheji: '#18120E',
};

export const defaultBrandMark = brandMarkBySlug['time-capsule-quiz'] ?? '#D85A3A';

export function brandMarkForSlug(slug: string): string {
  return brandMarkBySlug[slug] ?? defaultBrandMark;
}
