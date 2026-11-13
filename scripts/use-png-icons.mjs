import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/content/works');
const iconDir = path.resolve('public/icons');

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.mdoc')) continue;
  const slug = file.replace(/\.mdoc$/, '');
  const full = path.join(dir, file);
  let text = fs.readFileSync(full, 'utf8');
  const png = path.join(iconDir, `${slug}.png`);
  const next = fs.existsSync(png) ? `${slug}.png` : `${slug}.svg`;
  if (/^icon:/m.test(text)) {
    text = text.replace(/^icon:.*$/m, `icon: "${next}"`);
  } else {
    text = text.replace(/^gallery:.*$/m, (m) => `${m}\nicon: "${next}"`);
  }
  if (slug === 'goo-choki-paa') {
    text = text.replace(/^title:.*$/m, 'title: "グーチョキパーでなにつくろうシミュレーター"');
    text = text.replace(/^titleEn:.*$/m, 'titleEn: "Rock-Paper-Scissors Builder Simulator"');
  }
  fs.writeFileSync(full, text);
}
console.log('png icons + goo-choki title updated');
