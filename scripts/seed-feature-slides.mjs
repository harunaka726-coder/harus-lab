import fs from 'node:fs';
import path from 'node:path';

const slugs = [
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

const colors = {
  'time-capsule-quiz': '#C45C4A',
  appup: '#3D5A80',
  'appup-home': '#2F6F6A',
  'appup-flow': '#4A6FA5',
  'annoying-ninja': '#2C2C2C',
  mirrornote: '#6B5B4B',
  'mens-cycle': '#5C6B7A',
  logroom: '#7A8F5C',
  'goo-choki-paa': '#B87333',
  shinkanji: '#1C1C1C',
};

const dir = path.resolve('public/featuregraphic');
fs.mkdirSync(dir, { recursive: true });

const legacy = [
  'feature-graphic.png',
  'feature-graphic-en.png',
  'feature-graphic-1024x500.png',
  'feature-graphica.png',
];

for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  const png = path.join(dir, `${slug}.png`);
  const svg = path.join(dir, `${slug}.svg`);
  if (fs.existsSync(png)) continue;

  const legacyFile = legacy[i];
  if (legacyFile && fs.existsSync(path.join(dir, legacyFile))) {
    fs.copyFileSync(path.join(dir, legacyFile), png);
    console.log('copied', legacyFile, '->', `${slug}.png`);
    continue;
  }

  const bg = colors[slug] || '#666';
  const label = slug.replace(/-/g, ' ');
  const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="${bg}"/>
  <text x="512" y="250" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="42" font-weight="700">${label}</text>
  <text x="512" y="300" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="Arial, sans-serif" font-size="22">feature graphic placeholder</text>
</svg>`;
  fs.writeFileSync(svg, content);
  console.log('placeholder', `${slug}.svg`);
}

console.log('feature slides ready');
