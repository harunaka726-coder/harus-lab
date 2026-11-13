/**
 * Fix TCQ (CRLF parse) + dare-dakke ASC dumps + mirrornote titles.
 * Overwrites only ASC dump sidecars / polluted summary fields.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('..');
const WORKS = path.resolve('src/content/works');
const PUBLIC = path.resolve('public/works');

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function setFm(slug, patch, { force = false } = {}) {
  const file = path.join(WORKS, `${slug}.mdoc`);
  let text = fs.readFileSync(file, 'utf8');
  const changed = [];
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || String(value).trim() === '') continue;
    const line = `${key}: ${JSON.stringify(String(value))}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    if (re.test(text)) {
      const cur = text.match(re)?.[0] || '';
      const raw = cur.replace(/^[^:]+:\s*/, '').replace(/^"|"$/g, '');
      const bad =
        force ||
        /:\s*(""|)$/.test(cur) ||
        raw.startsWith('`') ||
        raw.includes('com.daredakke');
      if (bad) {
        text = text.replace(re, line);
        changed.push(key);
      }
    } else if (key.startsWith('title')) {
      text = text.replace(/^(titleEn:.*)$/m, `$1\n${line}`);
      changed.push(key);
    } else if (key.startsWith('summary')) {
      text = text.replace(/^(summaryEn:.*)$/m, `$1\n${line}`);
      changed.push(key);
    } else {
      text = text.replace(/^---\n/, `---\n${line}\n`);
      changed.push(key);
    }
  }
  if (changed.length) fs.writeFileSync(file, text);
  return changed;
}

function writeBody(slug, field, body, { force = false } = {}) {
  const file = path.join(WORKS, slug, `${field}.mdoc`);
  const trimmed = (body || '').trim();
  if (!trimmed) return false;
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim();
    if (existing.includes('## Bundle ID') || existing.startsWith('## Bundle')) {
      force = true;
    }
    if (!force && existing) return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${trimmed}\n`);
  return true;
}

function extractAscDesc(text) {
  const n = text.replace(/\r\n/g, '\n');
  return (
    n.match(/##\s*(?:Description|Descripción|描述)[^\n]*\n+([\s\S]*?)(?=\n##\s)/i)?.[1]?.trim() ||
    ''
  );
}

function extractAscName(text) {
  const n = text.replace(/\r\n/g, '\n');
  return (
    n.match(/##\s*(?:App Name|Nombre|应用名称|名称)[^\n]*\n+([^\n#]+)/i)?.[1]?.trim() || ''
  );
}

function extractAscSub(text) {
  const n = text.replace(/\r\n/g, '\n');
  return (
    n.match(/##\s*(?:Subtitle|Subtítulo|副标题)[^\n]*\n+([^\n#]+)/i)?.[1]?.trim() || ''
  );
}

function appendShots(slug, lang, field) {
  const shotDir = path.join(PUBLIC, slug, lang);
  const file = path.join(WORKS, slug, `${field}.mdoc`);
  if (!fs.existsSync(shotDir) || !fs.existsSync(file)) return;
  let body = fs.readFileSync(file, 'utf8');
  if (body.includes(`/works/${slug}/${lang}/`)) return;
  const shots = fs
    .readdirSync(shotDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();
  if (!shots.length) return;
  body =
    body.trimEnd() +
    '\n\n' +
    shots.map((f) => `![](/works/${slug}/${lang}/${f})`).join('\n\n') +
    '\n';
  fs.writeFileSync(file, body);
}

// --- TCQ ---
{
  const text = read(path.join(ROOT, 'MemoRefre', 'Store', 'play', 'listing.txt')).replace(
    /\r\n/g,
    '\n',
  );
  const langs = [
    ['en', /### English\n([\s\S]*?)(?=\n### |\n---)/],
    ['zh', /### 中文\n([\s\S]*?)(?=\n### |\n---)/],
    ['es', /### Español\n([\s\S]*?)(?=\n### |\n---|$)/],
  ];
  const shortBlock = text.match(/## 短い説明[\s\S]*?\n---/)?.[0] || '';
  const fullBlock = text.match(/## 詳細な説明[\s\S]*$/)?.[0] || text;
  const names = {
    en: 'Time Capsule Quiz',
    es: 'Quiz cápsula del tiempo',
    zh: '时光胶囊问答',
  };
  for (const [lang, re] of langs) {
    const short = shortBlock.match(re)?.[1]?.trim() || '';
    const full = fullBlock.match(re)?.[1]?.trim() || '';
    const field = lang === 'en' ? 'contentEn' : lang === 'es' ? 'contentEs' : 'contentZh';
    const wrote = writeBody('time-capsule-quiz', field, full, { force: true });
    const patch = {};
    if (lang === 'en' && short) patch.summaryEn = short;
    if (lang === 'es') {
      patch.titleEs = names.es;
      if (short) patch.summaryEs = short;
    }
    if (lang === 'zh') {
      patch.titleZh = names.zh;
      if (short) patch.summaryZh = short;
    }
    const fm = setFm('time-capsule-quiz', patch, { force: true });
    appendShots('time-capsule-quiz', lang, field);
    console.log(`tcq/${lang}: wrote=${wrote} fm=${fm.join(',')} short=${!!short} full=${full.length}`);
  }
}

// --- dare-dakke ---
for (const [lang, file] of [
  ['en', 'listing-en.md'],
  ['es', 'listing-es.md'],
  ['zh', 'listing-zh.md'],
]) {
  const text = read(path.join(ROOT, '誰だっけ', 'store', 'asc', file));
  const name = extractAscName(text);
  const short = extractAscSub(text);
  const full = extractAscDesc(text);
  const field = lang === 'en' ? 'contentEn' : lang === 'es' ? 'contentEs' : 'contentZh';
  const wrote = writeBody('dare-dakke', field, full, { force: true });
  const patch = {};
  if (lang === 'en') {
    if (name) patch.titleEn = name;
    if (short) patch.summaryEn = short;
  }
  if (lang === 'es') {
    if (name) patch.titleEs = name;
    if (short) patch.summaryEs = short;
  }
  if (lang === 'zh') {
    if (name) patch.titleZh = name;
    if (short) patch.summaryZh = short;
  }
  const fm = setFm('dare-dakke', patch, { force: true });
  console.log(`dare/${lang}: wrote=${wrote} name=${name} fm=${fm.join(',')}`);
}

// --- mirrornote titles ---
{
  const fm = setFm('mirrornote', { titleEs: 'MirrorNote', titleZh: 'MirrorNote' });
  console.log(`mirrornote titles: ${fm.join(',')}`);
}

console.log('fix done');
