/**
 * Import store listing copy from sibling project folders into HP works.
 * Never overwrites non-empty contentEn/Es/Zh sidecars or existing title/summary fields
 * unless --force is passed for a specific field (not used by default).
 *
 * Usage: node scripts/import-listings-from-projects.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('..'); // OneDrive/2026
const WORKS = path.resolve('src/content/works');

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function writeIfEmpty(file, body) {
  const trimmed = body.trim();
  if (!trimmed) return false;
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim();
    if (existing) return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, trimmed + '\n');
  return true;
}

function patchFrontmatter(slug, patch) {
  const file = path.join(WORKS, `${slug}.mdoc`);
  if (!fs.existsSync(file)) return [];
  let text = fs.readFileSync(file, 'utf8');
  const changed = [];
  for (const [key, value] of Object.entries(patch)) {
    if (!value?.trim()) continue;
    const re = new RegExp(`^${key}:.*$`, 'm');
    if (re.test(text)) {
      // only fill empty-ish optional fields if missing value after key for optional langs
      const m = text.match(re);
      if (m && /:\s*(""|''|\s*)$/.test(m[0])) {
        text = text.replace(re, `${key}: ${JSON.stringify(value)}`);
        changed.push(key);
      } else if (!['titleEs', 'titleZh', 'summaryEs', 'summaryZh'].includes(key)) {
        // required fields already set — skip
      } else if (!re.test(text)) {
        // shouldn't happen
      }
    } else {
      // insert after titleEn / summaryEn
      if (key.startsWith('title')) {
        text = text.replace(/^(titleEn:.*)$/m, `$1\n${key}: ${JSON.stringify(value)}`);
      } else if (key.startsWith('summary')) {
        text = text.replace(/^(summaryEn:.*)$/m, `$1\n${key}: ${JSON.stringify(value)}`);
      } else {
        text = text.replace(/^---\n/, `---\n${key}: ${JSON.stringify(value)}\n`);
      }
      changed.push(key);
    }
  }
  if (changed.length) fs.writeFileSync(file, text);
  return changed;
}

function extractLabeled(block, labels) {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:\\[|#|##|【|■|---|English|Español|中文|日本語|Japanese|Short |Full |Descripción|简|详|$))`,
      'i',
    );
    const m = block.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

function extractSection(text, startMarkers, endMarkers) {
  let start = -1;
  for (const m of startMarkers) {
    const i = text.search(m);
    if (i >= 0) {
      start = i;
      break;
    }
  }
  if (start < 0) return '';
  let end = text.length;
  for (const m of endMarkers) {
    const i = text.slice(start + 1).search(m);
    if (i >= 0) end = Math.min(end, start + 1 + i);
  }
  return text.slice(start, end);
}

/** Parse shinkanji-style [App name] / [Full description] files */
function parseBracketListing(text) {
  const name =
    text.match(/\[(?:App name|Nombre de la app|应用名称)\]\s*\n([^\n]+)/i)?.[1]?.trim() ||
    text.match(/【应用名称】\s*\n([^\n]+)/)?.[1]?.trim() ||
    '';
  const short =
    text.match(/\[(?:Short description|Descripción breve|简短说明)[^\]]*\][^\n]*\n([^\n]+)/i)?.[1]?.trim() ||
    text.match(/【简短说明】[^\n]*\n([^\n]+)/)?.[1]?.trim() ||
    '';
  const fullMatch =
    text.match(/\[(?:Full description|Descripción completa|详细说明)\]\s*\n([\s\S]*?)(?=\n\[|$)/i) ||
    text.match(/【详细说明】\s*\n([\s\S]*?)(?=\n【|$)/);
  const full = fullMatch?.[1]?.trim() || '';
  return { name, short, full };
}

/** MirrorNote listings.md style */
function parseMirrorNoteListings(text) {
  const out = {};
  const blocks = {
    en: extractSection(text, [/^## English/m], [/^## Español/m, /^## 中文/m, /^## /m]),
    es: extractSection(text, [/^## Español/m], [/^## 中文/m, /^## /m]),
    zh: extractSection(text, [/^## 中文/m], [/^## /m]),
    ja: extractSection(text, [/^## Japanese/m, /^## 日本語/m], [/^## English/m, /^## /m]),
  };
  for (const [lang, block] of Object.entries(blocks)) {
    if (!block) continue;
    const short =
      extractLabeled(block, [
        '### Short description[^\n]*',
        '### Descripción breve[^\n]*',
        '### 简短说明[^\n]*',
        '### 簡単な説明[^\n]*',
      ]) ||
      block.match(/(?:Short description|Descripción breve|简短说明|簡単な説明)[^\n]*\n([^\n]+)/)?.[1]?.trim() ||
      '';
    const full =
      extractLabeled(block, [
        '### Full description',
        '### Descripción completa',
        '### 详细说明',
        '### 詳細な説明',
      ]) || '';
    out[lang] = { short, full, name: '' };
  }
  return out;
}

/** ScreenNinja listing.txt multi-lang */
function parseScreenNinja(text) {
  const out = {};
  const parts = {
    en: extractSection(text, [/^English\s*$/m], [/^中文\s*$/m, /^Español\s*$/m]),
    zh: extractSection(text, [/^中文\s*$/m], [/^Español\s*$/m]),
    es: extractSection(text, [/^Español\s*$/m], [/^$/]),
    ja: extractSection(text, [/^日本語\s*$/m], [/^English\s*$/m]),
  };
  for (const [lang, block] of Object.entries(parts)) {
    if (!block) continue;
    const short =
      block.match(/(?:Short description|Descripción breve|简短说明|短い説明)\s*\n([^\n]+)/)?.[1]?.trim() || '';
    const full =
      block.match(
        /(?:Full description|Descripción completa|详细说明|詳しい説明)\s*\n([\s\S]*?)$/,
      )?.[1]?.trim() || '';
    out[lang] = { short, full, name: lang === 'en' || lang === 'es' || lang === 'zh' ? 'AnnoyingNinja' : '' };
  }
  return out;
}

function applyLocale(slug, lang, { name, short, full }) {
  const field = lang === 'en' ? 'contentEn' : lang === 'es' ? 'contentEs' : 'contentZh';
  const sidecar = path.join(WORKS, slug, `${field}.mdoc`);
  const wroteBody = writeIfEmpty(sidecar, full);
  const patch = {};
  if (lang === 'en') {
    // don't overwrite titleEn/summaryEn by default
  } else if (lang === 'es') {
    if (name) patch.titleEs = name;
    if (short) patch.summaryEs = short;
  } else if (lang === 'zh') {
    if (name) patch.titleZh = name;
    if (short) patch.summaryZh = short;
  }
  const fm = patchFrontmatter(slug, patch);
  return { wroteBody, fm };
}

const jobs = [];

// shinkanji
{
  const base = path.join(ROOT, 'shinkanji', 'store');
  for (const [lang, file] of [
    ['en', 'listing-en.txt'],
    ['es', 'listing-es.txt'],
    ['zh', 'listing-zh.txt'],
  ]) {
    const parsed = parseBracketListing(read(path.join(base, file)));
    jobs.push(['shinkanji', lang, parsed]);
  }
}

// MirrorNote
{
  const parsed = parseMirrorNoteListings(read(path.join(ROOT, 'MirrorNote', 'store', 'listings.md')));
  for (const lang of ['en', 'es', 'zh']) {
    if (parsed[lang]) jobs.push(['mirrornote', lang, parsed[lang]]);
  }
}

// AnnoyingNinja / ScreenNinja
{
  const parsed = parseScreenNinja(read(path.join(ROOT, 'ScreenNinja', 'store', 'play', 'listing.txt')));
  for (const lang of ['en', 'es', 'zh']) {
    if (parsed[lang]) jobs.push(['annoying-ninja', lang, parsed[lang]]);
  }
}

// 誰だっけ — Description / Name / Subtitle only (not full ASC dump)
for (const [lang, file] of [
  ['en', 'listing-en.md'],
  ['es', 'listing-es.md'],
  ['zh', 'listing-zh.md'],
]) {
  const text = read(path.join(ROOT, '誰だっけ', 'store', 'asc', file)).replace(/\r\n/g, '\n');
  if (!text) continue;
  const name =
    text.match(/##\s*(?:App Name|Nombre|应用名称|名称)[^\n]*\n+([^\n#]+)/i)?.[1]?.trim() || '';
  const short =
    text.match(/##\s*(?:Subtitle|Subtítulo|副标题)[^\n]*\n+([^\n#]+)/i)?.[1]?.trim() || '';
  const full =
    text.match(/##\s*(?:Description|Descripción|描述)[^\n]*\n+([\s\S]*?)(?=\n##\s)/i)?.[1]?.trim() ||
    '';
  jobs.push(['dare-dakke', lang, { name, short, full }]);
}

let report = [];
for (const [slug, lang, data] of jobs) {
  const r = applyLocale(slug, lang, data);
  report.push(`${slug}/${lang}: body=${r.wroteBody ? 'wrote' : 'keep'} fm=[${r.fm.join(',')}]`);
}
console.log(report.join('\n'));
console.log('done', report.length, 'jobs');
