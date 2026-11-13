import fs from 'node:fs';
import path from 'node:path';

const featured = new Set([
  'time-capsule-quiz',
  'appup',
  'appup-home',
  'appup-flow',
  'annoying-ninja',
  'mirrornote',
  'mens-cycle',
  'logroom',
  'goo-choki-paa',
  'shinkanji',
]);

const orderFeatured = [
  'time-capsule-quiz',
  'appup',
  'appup-home',
  'appup-flow',
  'annoying-ninja',
  'mirrornote',
  'mens-cycle',
  'logroom',
  'goo-choki-paa',
  'shinkanji',
];

const dir = path.resolve('src/content/works');
const iconDir = path.resolve('public/icons');
fs.mkdirSync(iconDir, { recursive: true });

const colors = {
  'time-capsule-quiz': ['#C45C4A', '#F4E6D8'],
  appup: ['#3D5A80', '#E8EEF5'],
  'appup-home': ['#2F6F6A', '#E4F1EF'],
  'appup-flow': ['#4A6FA5', '#E8EEF7'],
  'annoying-ninja': ['#2C2C2C', '#F0EDE8'],
  mirrornote: ['#6B5B4B', '#F3EEE7'],
  'mens-cycle': ['#5C6B7A', '#EBEEF1'],
  logroom: ['#7A8F5C', '#EEF2E6'],
  'goo-choki-paa': ['#B87333', '#F7EFE4'],
  shinkanji: ['#1C1C1C', '#F4F0EA'],
  camerepo: ['#8A8A8A', '#F2F2F0'],
  'illust-michiannai': ['#8A8A8A', '#F2F2F0'],
  'pennant-penalty': ['#8A8A8A', '#F2F2F0'],
  statescore: ['#8A8A8A', '#F2F2F0'],
  euroscore: ['#8A8A8A', '#F2F2F0'],
  chinascore: ['#8A8A8A', '#F2F2F0'],
  'dare-dakke': ['#8A8A8A', '#F2F2F0'],
  awayer: ['#8A8A8A', '#F2F2F0'],
  'bodyline-ai': ['#8A8A8A', '#F2F2F0'],
  'chain-quest': ['#8A8A8A', '#F2F2F0'],
};

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.mdoc')) continue;
  const slug = file.replace(/\.mdoc$/, '');
  const full = path.join(dir, file);
  let text = fs.readFileSync(full, 'utf8');
  const gallery = featured.has(slug) ? 'featured' : 'others';
  const galleryOrder = orderFeatured.indexOf(slug);
  const orderLine = galleryOrder >= 0 ? galleryOrder + 1 : 100;

  if (/^gallery:/m.test(text)) {
    text = text.replace(/^gallery:.*$/m, `gallery: ${gallery}`);
  } else {
    text = text.replace(/^featured:.*$/m, `featured: ${gallery === 'featured'}\ngallery: ${gallery}`);
  }
  if (!/^icon:/m.test(text)) {
    text = text.replace(/^gallery:.*$/m, (m) => `${m}\nicon: "${slug}.svg"`);
  } else {
    text = text.replace(/^icon:.*$/m, `icon: "${slug}.svg"`);
  }
  text = text.replace(/^order:.*$/m, `order: ${orderLine === 100 ? 50 + Math.abs(slug.length) : orderLine}`);
  // keep others ordered after featured with stable order
  if (gallery === 'others') {
    const othersOrder = [
      'camerepo',
      'illust-michiannai',
      'pennant-penalty',
      'statescore',
      'euroscore',
      'chinascore',
      'dare-dakke',
      'awayer',
      'bodyline-ai',
      'chain-quest',
    ];
    const oi = othersOrder.indexOf(slug);
    text = text.replace(/^order:.*$/m, `order: ${oi >= 0 ? 100 + oi : 199}`);
  }

  fs.writeFileSync(full, text);

  const [bg, fg] = colors[slug] || ['#888', '#f2f2f0'];
  const label = slug
    .split('-')
    .map((s) => s[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${bg}"/>
  <text x="256" y="292" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="140" fill="${fg}">${label}</text>
</svg>`;
  fs.writeFileSync(path.join(iconDir, `${slug}.svg`), svg);
}

console.log('updated gallery + icons');
