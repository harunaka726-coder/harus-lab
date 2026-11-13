import fs from 'node:fs';
import path from 'node:path';

/**
 * Desired featured order (Works + slideshow).
 * Manual only — Keystatic order edits are authoritative unless you run this on purpose.
 * TCQ → シン漢字 → MN → AU → AUH → AUF → AN → MC → LR → GCP
 */
const featuredOrder = [
  'time-capsule-quiz',
  'shinkanji',
  'mirrornote',
  'appup',
  'appup-home',
  'appup-flow',
  'annoying-ninja',
  'mens-cycle',
  'logroom',
  'goo-choki-paa',
];

const dir = path.resolve('src/content/works');
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.mdoc')) continue;
  const slug = file.replace(/\.mdoc$/, '');
  const full = path.join(dir, file);
  let text = fs.readFileSync(full, 'utf8');
  const idx = featuredOrder.indexOf(slug);
  if (idx >= 0) {
    text = text.replace(/^order:.*$/m, `order: ${idx + 1}`);
    fs.writeFileSync(full, text);
    console.log(slug, '->', idx + 1);
  }
}
console.log('featured order fixed');
