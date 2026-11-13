/**
 * Sync Play Store locale screenshots into public/works/{slug}/{lang}/
 * Clean duplicate markdown images from work bodies.
 * Fix TCQ ja folder pollution.
 */
import fs from 'node:fs';
import path from 'node:path';

const HP = path.resolve('.');
const ROOT = path.resolve('..');
const PROJECTS = path.resolve(process.env.USERPROFILE || '', 'Projects');
const PUBLIC = path.join(HP, 'public/works');
const WORKS = path.join(HP, 'src/content/works');

const SKIP = /feature|header|search|icon|_raw-|preview-|aab$|apk$/i;

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function clearDir(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isFile()) fs.unlinkSync(p);
  }
}

function copyShots(slug, lang, srcDir, { clear = true, pred } = {}) {
  if (!fs.existsSync(srcDir)) {
    console.log(`  miss ${slug}/${lang}: ${srcDir}`);
    return 0;
  }
  const dest = path.join(PUBLIC, slug, lang);
  ensureDir(dest);
  if (clear) clearDir(dest);
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !SKIP.test(f) && (!pred || pred(f)))
    .sort();
  for (const f of files) {
    fs.copyFileSync(path.join(srcDir, f), path.join(dest, f));
  }
  console.log(`  ${slug}/${lang}: ${files.length} from ${srcDir}`);
  return files.length;
}

function stripImagesInFile(file) {
  if (!fs.existsSync(file)) return false;
  const text = fs.readFileSync(file, 'utf8');
  const next = text
    .replace(/!\[[^\]]*\]\([^)]+\)\s*/g, '')
    .replace(/\n{3,}/g, '\n\n');
  if (next !== text) {
    fs.writeFileSync(file, next.trimEnd() + '\n');
    return true;
  }
  return false;
}

function setFm(slug, patch) {
  const file = path.join(WORKS, `${slug}.mdoc`);
  let text = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(patch)) {
    const line = `${key}: ${JSON.stringify(String(value))}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    if (re.test(text)) text = text.replace(re, line);
    else if (key.startsWith('title')) text = text.replace(/^(titleEn:.*)$/m, `$1\n${line}`);
    else text = text.replace(/^---\n/, `---\n${line}\n`);
  }
  fs.writeFileSync(file, text);
}

// --- TCQ: rebuild locale folders cleanly ---
{
  const base = path.join(ROOT, 'MemoRefre', 'Store', 'play', 'final');
  // ja: only hyphenated names without _en/_es/_ch
  copyShots('time-capsule-quiz', 'ja', base, {
    pred: (f) => /^\d{2}-[a-z]+\.png$/i.test(f),
  });
  for (const lang of ['en', 'es', 'zh']) {
    copyShots('time-capsule-quiz', lang, path.join(base, lang));
  }
}

// --- AppUp ---
{
  const base = path.join(ROOT, 'AppUp', 'store', 'play', 'final');
  copyShots('appup', 'ja', base, { pred: (f) => /^\d{2}-/.test(f) });
  for (const lang of ['en', 'es', 'zh']) {
    copyShots('appup', lang, path.join(base, lang));
  }
  // remove root-level duplicates
  for (const f of ['01-size.png', '02-day.png', '03-week.png', '04-replay.png']) {
    const p = path.join(PUBLIC, 'appup', f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

// --- AppUp Home ---
{
  const base = path.join(ROOT, 'AppUp Home', 'store', 'play', 'final');
  if (fs.existsSync(base)) {
    copyShots('appup-home', 'ja', base, { pred: (f) => /^\d{2}-/.test(f) });
    for (const lang of ['en', 'es', 'zh']) {
      copyShots('appup-home', lang, path.join(base, lang));
    }
  }
}

// --- App-Up Flow ---
{
  const base = path.join(PROJECTS, 'AppFlow', 'store', 'play');
  for (const lang of ['ja', 'en', 'es', 'zh']) {
    copyShots('appup-flow', lang, path.join(base, lang));
  }
}

// --- goo-choki-paa ---
{
  const base = path.join(ROOT, 'RockScissorsPaper', 'store', 'play');
  copyShots('goo-choki-paa', 'ja', path.join(base, 'ja'));
  copyShots('goo-choki-paa', 'en', path.join(base, 'en'));
  // es/zh → en via workScreenshots fallback; still copy en into es/zh for clarity
  copyShots('goo-choki-paa', 'es', path.join(base, 'en'));
  copyShots('goo-choki-paa', 'zh', path.join(base, 'en'));
}

// --- pennant / statescore / euroscore / chinascore (ja+en; es/zh→en) ---
{
  const pennant = path.join(ROOT, 'プロ野球順位予想アプリ', 'store', 'appstore');
  copyShots('pennant-penalty', 'ja', pennant, { pred: (f) => /^\d{2}-/.test(f) });
  copyShots('pennant-penalty', 'en', pennant, { pred: (f) => /^\d{2}-/.test(f) });

  const state = path.join(ROOT, 'StateScore', 'store', 'appstore', 'iphone-61');
  if (fs.existsSync(state)) {
    copyShots('statescore', 'ja', state);
    copyShots('statescore', 'en', state);
  }

  const euro = path.join(ROOT, 'EuroScore', 'Store', 'appstore', 'iphone-61');
  copyShots('euroscore', 'ja', euro);
  copyShots('euroscore', 'en', euro);

  const china = path.join(ROOT, 'ChinaScore', 'store', 'play', 'final');
  if (fs.existsSync(china)) {
    copyShots('chinascore', 'ja', china, { pred: (f) => /^\d{2}-/.test(f) });
    copyShots('chinascore', 'en', china, { pred: (f) => /^\d{2}-/.test(f) });
    copyShots('chinascore', 'zh', china, { pred: (f) => /^\d{2}-/.test(f) });
  }
}

// --- dare-dakke (ASC per lang) ---
{
  const base = path.join(ROOT, '誰だっけ', 'store', 'asc');
  for (const lang of ['ja', 'en', 'es', 'zh']) {
    copyShots('dare-dakke', lang, path.join(base, lang), {
      pred: (f) => /^iphone67-.*\.png$/i.test(f),
    });
  }
}

// --- AWAYER ---
{
  const src = path.join(
    ROOT,
    'AWAYER',
    'store',
    'appstore',
    'screenshots',
    'dynamic-island-large-1260x2736',
  );
  copyShots('awayer', 'ja', src);
  copyShots('awayer', 'en', src);
}

// --- BodyLine AI (ja+en; es/zh→en) ---
{
  const base = path.join(ROOT, 'BodyLine AI', 'store', 'play', 'final');
  copyShots('bodyline-ai', 'ja', base, { pred: (f) => /^\d{2}-/.test(f) });
  copyShots('bodyline-ai', 'en', path.join(base, 'en'));
  copyShots('bodyline-ai', 'es', path.join(base, 'en'));
  copyShots('bodyline-ai', 'zh', path.join(base, 'en'));
}

// --- shinkanji (locale folders under store/play) ---
{
  const base = path.join(ROOT, 'shinkanji', 'store', 'play');
  for (const lang of ['ja', 'en', 'es', 'zh']) {
    copyShots('shinkanji', lang, path.join(base, lang), { pred: (f) => /^\d{2}-/.test(f) });
  }
}

// --- MirrorNote ---
{
  const base = path.join(ROOT, 'MirrorNote', 'store', 'play', 'final');
  for (const lang of ['ja', 'en', 'es', 'zh']) {
    copyShots('mirrornote', lang, path.join(base, lang));
  }
}

// --- Men's Cycle ---
{
  const finalJa = path.join(PROJECTS, 'MensCycle', 'store-listing', 'play-shots', 'final');
  const locales = path.join(PROJECTS, 'MensCycle', 'store-listing', 'play-shots', 'locales');
  copyShots('mens-cycle', 'ja', finalJa, {
    pred: (f) => /^\d{2}-/.test(f) && !/^Screenshot/i.test(f),
  });
  for (const lang of ['en', 'es', 'zh']) {
    copyShots('mens-cycle', lang, path.join(locales, lang), {
      pred: (f) => /^\d{2}-/.test(f),
    });
  }
}

// --- LogRoom (clean-app play-shots) ---
{
  const base = path.join(ROOT, 'clean-app', 'play-store', 'play-shots', 'final');
  // root files = ja
  copyShots('logroom', 'ja', base, { pred: (f) => /^\d{2}-/.test(f) });
  for (const lang of ['en', 'es', 'zh']) {
    copyShots('logroom', lang, path.join(base, lang));
  }
  // remove old ASC-copied folders if any leftover wrong shots — already cleared by copyShots
}

// --- AnnoyingNinja / ScreenNinja locale finals ---
{
  const base = path.join(ROOT, 'ScreenNinja', 'store', 'play', 'final');
  const renameEn = (f) => {
    const m = f.match(/^en(\d+)\.png$/i);
    return m ? `${String(m[1]).padStart(2, '0')}.png` : f;
  };
  // ja = root final
  {
    const dest = path.join(PUBLIC, 'annoying-ninja', 'ja');
    ensureDir(dest);
    clearDir(dest);
    for (const f of fs.readdirSync(base).filter((x) => /^\d+\.png$/i.test(x))) {
      fs.copyFileSync(path.join(base, f), path.join(dest, f.padStart ? f : f));
      const num = f.match(/(\d+)/)?.[1];
      if (num) fs.copyFileSync(path.join(base, f), path.join(dest, `${String(num).padStart(2, '0')}.png`));
    }
    console.log('  annoying-ninja/ja synced');
  }
  for (const lang of ['en', 'es', 'zh']) {
    const src = path.join(base, lang);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(PUBLIC, 'annoying-ninja', lang);
    ensureDir(dest);
    clearDir(dest);
    for (const f of fs.readdirSync(src).filter((x) => /\.png$/i.test(x) && !/feature/i.test(x))) {
      fs.copyFileSync(path.join(src, f), path.join(dest, renameEn(f)));
    }
    console.log(`  annoying-ninja/${lang} synced`);
  }
}

// --- web services: keep root images (タイトルなし.png etc.) ---
console.log('  camerepo/chain-quest/illust: keep root images');

// Strip markdown images from all work bodies + sidecars
let stripped = 0;
for (const f of fs.readdirSync(WORKS)) {
  if (f.endsWith('.mdoc')) {
    if (stripImagesInFile(path.join(WORKS, f))) stripped++;
  }
  const dir = path.join(WORKS, f);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    for (const sf of fs.readdirSync(dir)) {
      if (sf.endsWith('.mdoc') && stripImagesInFile(path.join(dir, sf))) stripped++;
    }
  }
}
console.log(`stripped images from ${stripped} files`);

// KameRepo naming
setFm('camerepo', {
  titleEn: 'KameRepo',
  titleEs: 'KameRepo',
  titleZh: 'KameRepo',
});
const camEn = path.join(WORKS, 'camerepo', 'contentEn.mdoc');
if (fs.existsSync(camEn)) {
  let t = fs.readFileSync(camEn, 'utf8');
  t = t.replace(/CameRepo/g, 'KameRepo');
  fs.writeFileSync(camEn, t);
}
for (const f of ['contentEs.mdoc', 'contentZh.mdoc']) {
  const p = path.join(WORKS, 'camerepo', f);
  if (fs.existsSync(p)) {
    let t = fs.readFileSync(p, 'utf8');
    t = t.replace(/CameRepo/g, 'KameRepo').replace(/カメレポ/g, 'KameRepo');
    fs.writeFileSync(p, t);
  }
}

console.log('sync-play-screenshots done');
