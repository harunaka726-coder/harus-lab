/**
 * Import remaining store listings + copy locale screenshots.
 * Never overwrites non-empty contentEn/Es/Zh sidecars.
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

function writeIfEmpty(file, body) {
  const trimmed = (body || '').trim();
  if (!trimmed) return false;
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim();
    if (existing) return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, trimmed + '\n');
  return true;
}

function setFrontmatter(slug, patch) {
  const file = path.join(WORKS, `${slug}.mdoc`);
  if (!fs.existsSync(file)) return [];
  let text = fs.readFileSync(file, 'utf8');
  const changed = [];
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || String(value).trim() === '') continue;
    const line = `${key}: ${JSON.stringify(String(value))}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    if (re.test(text)) {
      // only add missing optional locale fields when absent value is empty optional — skip if already set
      const cur = text.match(re)?.[0] || '';
      if (/:\s*(""|)$/.test(cur) || cur === `${key}:`) {
        text = text.replace(re, line);
        changed.push(key);
      }
    } else {
      if (key.startsWith('title')) {
        text = text.replace(/^(titleEn:.*)$/m, `$1\n${line}`);
      } else if (key.startsWith('summary')) {
        text = text.replace(/^(summaryEn:.*)$/m, `$1\n${line}`);
      } else {
        text = text.replace(/^---\n/, `---\n${line}\n`);
      }
      changed.push(key);
    }
  }
  if (changed.length) fs.writeFileSync(file, text);
  return changed;
}

function apply(slug, lang, { name, short, full }) {
  const field = lang === 'en' ? 'contentEn' : lang === 'es' ? 'contentEs' : 'contentZh';
  const wrote = writeIfEmpty(path.join(WORKS, slug, `${field}.mdoc`), full);
  const patch = {};
  if (lang === 'es') {
    if (name) patch.titleEs = name;
    if (short) patch.summaryEs = short;
  } else if (lang === 'zh') {
    if (name) patch.titleZh = name;
    if (short) patch.summaryZh = short;
  } else if (lang === 'en') {
    // keep existing titleEn/summaryEn
  }
  const fm = setFrontmatter(slug, patch);
  return { wrote, fm };
}

function extractAscDescription(text) {
  // ## Description / ## Descripción / ## 描述 / 説明（4000）
  const m =
    text.match(/##\s*(?:Description|Descripción|描述|説明)[^\n]*\n+([\s\S]*?)(?=\n##\s|\n#\s|$)/i) ||
    text.match(/###\s*(?:Description|Descripción|描述|詳しい説明|詳細な説明)[^\n]*\n+([\s\S]*?)(?=\n###|\n##|$)/i);
  return m?.[1]?.trim() || '';
}

function extractAscName(text) {
  return (
    text.match(/##\s*(?:Name|Nombre|名称)[^\n]*\n+([^\n#]+)/i)?.[1]?.trim() ||
    text.match(/\*\*アプリ名\*\*\s*\n([^\n]+)/)?.[1]?.trim() ||
    text.match(/\*\*App name\*\*\s*\n([^\n]+)/)?.[1]?.trim() ||
    ''
  );
}

function extractAscShort(text) {
  return (
    text.match(/##\s*(?:Subtitle|Subtítulo|副标题)[^\n]*\n+([^\n#]+)/i)?.[1]?.trim() ||
    text.match(/\*\*短い説明[^\n]*\*\*\s*\n([^\n]+)/)?.[1]?.trim() ||
    text.match(/\*\*Short description\*\*\s*\n([^\n]+)/)?.[1]?.trim() ||
    ''
  );
}

function parseCleanAppListing(text) {
  const name = text.match(/##\s*(?:Name|Nombre|名称)[^\n]*\n([^\n]+)/)?.[1]?.trim() || '';
  const short =
    text.match(/##\s*(?:Subtitle|Subtítulo|副标题)[^\n]*\n([^\n]+)/)?.[1]?.trim() || '';
  const full =
    text.match(/##\s*(?:Description|Descripción|描述)[^\n]*\n([\s\S]*?)(?=\n##\s)/)?.[1]?.trim() ||
    '';
  return { name, short, full };
}

function parseMemoRefreTcq(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const out = {};
  const langs = [
    ['ja', /### 日本語\n([\s\S]*?)(?=\n### |\n---)/],
    ['en', /### English\n([\s\S]*?)(?=\n### |\n---)/],
    ['zh', /### 中文\n([\s\S]*?)(?=\n### |\n---)/],
    ['es', /### Español\n([\s\S]*?)(?=\n### |\n---|$)/],
  ];
  const shortBlock = normalized.match(/## 短い説明[\s\S]*?\n---/)?.[0] || '';
  const fullBlock = normalized.match(/## 詳細な説明[\s\S]*$/)?.[0] || normalized;
  for (const [lang, re] of langs) {
    const short = shortBlock.match(re)?.[1]?.trim() || '';
    const full = fullBlock.match(re)?.[1]?.trim() || '';
    out[lang] = { short, full, name: '' };
  }
  out.en.name = 'Time Capsule Quiz';
  out.es.name = 'Quiz cápsula del tiempo';
  out.zh.name = '时光胶囊问答';
  return out;
}

function parsePlayMd(text) {
  const name =
    text.match(/##\s*アプリ名[^\n]*\n\n([^\n]+)/)?.[1]?.trim() ||
    text.match(/##\s*App name[^\n]*\n\n([^\n]+)/)?.[1]?.trim() ||
    '';
  const short =
    text.match(/##\s*(?:簡単な説明|Short description)[^\n]*\n\n([^\n]+)/)?.[1]?.trim() || '';
  const full =
    text.match(/##\s*(?:詳細な説明|Full description)\n\n([\s\S]*?)(?=\n##\s|$)/)?.[1]?.trim() || '';
  return { name, short, full };
}

function parseBodyLine(text) {
  const out = {};
  const ja = text.match(/## 日本語\n([\s\S]*?)(?=\n## English)/)?.[1] || '';
  const en = text.match(/## English\n([\s\S]*?)(?=\n## |$)/)?.[1] || '';
  out.ja = {
    name: ja.match(/\*\*アプリ名\*\*\s*\n([^\n]+)/)?.[1]?.trim() || 'BodyLine AI',
    short: ja.match(/\*\*短い説明[^\n]*\*\*\s*\n([^\n]+)/)?.[1]?.trim() || '',
    full: ja.match(/\*\*詳しい説明\*\*\s*\n([\s\S]*?)$/)?.[1]?.trim() || '',
  };
  out.en = {
    name: en.match(/\*\*App name\*\*\s*\n([^\n]+)/)?.[1]?.trim() || 'BodyLine AI',
    short: en.match(/\*\*Short description\*\*\s*\n([^\n]+)/)?.[1]?.trim() || '',
    full: en.match(/\*\*Full description\*\*\s*\n([\s\S]*?)$/)?.[1]?.trim() || '',
  };
  return out;
}

function parseAwayer(text) {
  const jaDesc = text.match(/### 説明（4000）\n```\n([\s\S]*?)\n```/)?.[1]?.trim() || '';
  const enDesc = text.match(/### Description \(4000\)\n```\n([\s\S]*?)\n```/)?.[1]?.trim() || '';
  const jaSub = text.match(/### サブタイトル（30）\n```\n([^\n]+)\n```/)?.[1]?.trim() || '';
  const enSub = text.match(/### Subtitle \(30\)\n```\n([^\n]+)\n```/)?.[1]?.trim() || '';
  return {
    ja: { name: 'AWAYER', short: jaSub, full: jaDesc },
    en: { name: 'AWAYER', short: enSub, full: enDesc },
  };
}

function parsePennant(text) {
  const name = text.match(/■ 名前[^\n]*\n([^\n]+)/)?.[1]?.trim() || '';
  const short = text.match(/■ サブタイトル[^\n]*\n([^\n]+)/)?.[1]?.trim() || '';
  const full = text.match(/■ 説明\n([\s\S]*?)(?=\n■ )/)?.[1]?.trim() || '';
  return { name, short, full };
}

function parseEuro(text) {
  const name = 'EuroScore';
  const short = text.match(/SUBTITLE[\s\S]*?\n={3,}\n([^\n]+)/)?.[1]?.trim() || '';
  const full = text.match(/DESCRIPTION\n={3,}\n([\s\S]*?)\n={3,}\nKEYWORDS/)?.[1]?.trim() || '';
  return { name, short, full };
}

function parseChina(text) {
  const name = text.match(/## アプリ名[^\n]*\n([^\n]+)/)?.[1]?.trim() || '';
  const short = text.match(/## 簡単な説明[^\n]*\n([^\n]+)/)?.[1]?.trim() || '';
  const full = text.match(/## 詳しい説明[^\n]*\n([\s\S]*?)$/)?.[1]?.trim() || '';
  return { name, short, full };
}

function copyShots(slug, lang, srcDir) {
  if (!fs.existsSync(srcDir)) return 0;
  const dest = path.join(PUBLIC, slug, lang);
  fs.mkdirSync(dest, { recursive: true });
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/feature/i.test(f))
    .sort();
  let n = 0;
  for (const f of files) {
    const to = path.join(dest, f);
    if (!fs.existsSync(to)) {
      fs.copyFileSync(path.join(srcDir, f), to);
      n++;
    }
  }
  return n;
}

function appendShotMarkdown(slug, lang) {
  const field = lang === 'en' ? 'contentEn' : lang === 'es' ? 'contentEs' : lang === 'zh' ? 'contentZh' : null;
  if (!field) return;
  const file = path.join(WORKS, slug, `${field}.mdoc`);
  const shotDir = path.join(PUBLIC, slug, lang);
  if (!fs.existsSync(file) || !fs.existsSync(shotDir)) return;
  let body = fs.readFileSync(file, 'utf8');
  if (body.includes(`/works/${slug}/${lang}/`)) return;
  const shots = fs
    .readdirSync(shotDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();
  if (!shots.length) return;
  const md = '\n\n' + shots.map((f) => `![](/works/${slug}/${lang}/${f})`).join('\n\n') + '\n';
  fs.writeFileSync(file, body.trimEnd() + md);
}

const log = [];

// --- LogRoom (clean-app) ---
{
  const base = path.join(ROOT, 'clean-app', 'app-store', 'listing');
  const map = [
    ['en', 'en-US.txt'],
    ['es', 'es-ES.txt'],
    ['zh', 'zh-Hans.txt'],
  ];
  for (const [lang, file] of map) {
    const parsed = parseCleanAppListing(read(path.join(base, file)));
    const r = apply('logroom', lang, parsed);
    log.push(`logroom/${lang}: body=${r.wrote} fm=${r.fm.join(',')}`);
  }
  // ja screenshots from MemoRefre? LogRoom shots may be elsewhere — skip if unknown
}

// --- Time Capsule Quiz (MemoRefre listing.txt) ---
{
  const parsed = parseMemoRefreTcq(read(path.join(ROOT, 'MemoRefre', 'Store', 'play', 'listing.txt')));
  for (const lang of ['en', 'es', 'zh']) {
    const r = apply('time-capsule-quiz', lang, parsed[lang] || {});
    log.push(`time-capsule-quiz/${lang}: body=${r.wrote} fm=${r.fm.join(',')}`);
  }
  for (const lang of ['en', 'es', 'zh']) {
    const n = copyShots('time-capsule-quiz', lang, path.join(ROOT, 'MemoRefre', 'Store', 'play', 'final', lang));
    appendShotMarkdown('time-capsule-quiz', lang);
    log.push(`time-capsule-quiz/${lang} shots+=${n}`);
  }
  // ja final shots without lang folder
  const nJa = copyShots('time-capsule-quiz', 'ja', path.join(ROOT, 'MemoRefre', 'Store', 'play', 'final'));
  log.push(`time-capsule-quiz/ja shots+=${nJa}`);
}

// --- goo-choki-paa ---
{
  const en = parsePlayMd(read(path.join(ROOT, 'RockScissorsPaper', 'store', 'play-store-listing-en.md')));
  const ja = parsePlayMd(read(path.join(ROOT, 'RockScissorsPaper', 'store', 'play-store-listing-ja.md')));
  apply('goo-choki-paa', 'en', en);
  // ES/ZH drafts from EN
  apply('goo-choki-paa', 'es', {
    name: 'Simulador de piedra, papel o tijera',
    short: 'Coloca manos de piedra, papel y tijera para probar ideas creativas.',
    full:
      en.full
        .replace(/Rock Paper Scissors Simulator/g, 'Simulador de piedra, papel o tijera')
        .replace(/A practical simulator for childcare workers and parents\./, 'Un simulador práctico para educadores y familias.')
        .replace(/Place 3D rock, scissors, and paper hands/g, 'Coloca manos 3D de piedra, papel y tijera') ||
      en.full,
  });
  apply('goo-choki-paa', 'zh', {
    name: '剪刀石头布创作模拟器',
    short: '在屏幕上摆放石头、剪刀、布，模拟创意造型。',
    full:
      '面向保育与亲子场景的实用模拟器。\n\n在屏幕上摆放石头、剪刀、布的 3D 手型，先试蜗牛、花朵、自由造型等，再动手做纸工或真实手势。适合备课、玩法灵感和与孩子一起探索形状。\n\n【适用场景】\n・构思剪刀石头布相关的手工或游戏\n・和孩子一起试姿势与造型\n・在摆放纸张或道具前先在屏幕上模拟\n\n【功能】\n・添加石头／剪刀／布并自由摆放\n・移动、旋转、缩放\n・保存作品与图库管理\n・将作品分享为图片\n\n轻松试错与调整，帮你准备课堂或亲子游戏点子。',
  });
  for (const lang of ['en', 'ja']) {
    const n = copyShots('goo-choki-paa', lang, path.join(ROOT, 'RockScissorsPaper', 'store', 'play', lang));
    if (lang === 'en') appendShotMarkdown('goo-choki-paa', 'en');
    log.push(`goo-choki-paa/${lang} shots+=${n}`);
  }
  log.push(`goo-choki-paa ja-name kept; en/es/zh imported`);
}

// --- AppUp screenshots + drafted locale copy from JA body ---
{
  const jaBody = read(path.join(WORKS, 'appup.mdoc')).replace(/^---[\s\S]*?---\s*/, '');
  apply('appup', 'en', {
    name: 'App-Up',
    short: 'See app usage as bubbles. For digital minimalists.',
    full: `App-Up shows how long you use each app as bubble size. Apps you open a lot grow large, so your habits are visible at a glance—not as a spreadsheet, but as a feeling.\n\nIt is for people who want distance from the screen and a more digital-minimal life. Move the bubbles with your finger.\n\nDon’t drown in app bubbles.`,
  });
  apply('appup', 'es', {
    name: 'App-Up',
    short: 'El uso de apps como burbujas. Para el minimalismo digital.',
    full: `App-Up muestra el tiempo de uso de cada app como tamaño de burbuja. Las que abres mucho se hacen grandes: ves tus hábitos de un vistazo.\n\nPensada para quienes quieren distancia de la pantalla y un uso más minimalista. Puedes mover las burbujas con el dedo.\n\nQue las burbujas no te ahoguen.`,
  });
  apply('appup', 'zh', {
    name: 'App-Up',
    short: '用气泡大小看清应用使用时间。适合数字极简。',
    full: `App-Up 用气泡大小表示各应用的使用时间。常用应用会变大，一眼看出习惯——不是细抠数字，而是感受使用距离。\n\n适合想减少刷机、走向数字极简的人。可用手指移动气泡。\n\n别沉进应用的气泡里。`,
  });
  for (const lang of ['en', 'es', 'zh']) {
    const n = copyShots('appup', lang, path.join(ROOT, 'AppUp', 'store', 'play', 'final', lang));
    appendShotMarkdown('appup', lang);
    log.push(`appup/${lang} shots+=${n}`);
  }
  const nJa = copyShots('appup', 'ja', path.join(ROOT, 'AppUp', 'store', 'play', 'final'));
  log.push(`appup/ja shots+=${nJa}`);
}

// --- AppUp Home ---
{
  apply('appup-home', 'en', {
    name: 'App-Up Home',
    short: 'Home-screen bubbles of your app time.',
    full: `App-Up Home brings usage bubbles to your home screen. See which apps grow large without opening a dashboard.\n\nA lightweight companion to App-Up for digital minimalists who want a quiet daily reminder.`,
  });
  apply('appup-home', 'es', {
    name: 'App-Up Home',
    short: 'Burbujas de uso en la pantalla de inicio.',
    full: `App-Up Home lleva las burbujas de uso a tu pantalla de inicio. Ves qué apps crecen sin abrir un panel.\n\nCompañero ligero de App-Up para quien busca un recordatorio diario y calmado.`,
  });
  apply('appup-home', 'zh', {
    name: 'App-Up Home',
    short: '在主屏幕用气泡查看应用使用时间。',
    full: `App-Up Home 把使用时长气泡放到主屏幕。不必打开面板，也能看见哪些应用在变大。\n\n适合想要安静每日提醒的数字极简用户，是 App-Up 的轻量伴侣。`,
  });
  for (const lang of ['en', 'es', 'zh']) {
    const n = copyShots('appup-home', lang, path.join(ROOT, 'AppUp Home', 'store', 'play', 'final', lang));
    appendShotMarkdown('appup-home', lang);
    log.push(`appup-home/${lang} shots+=${n}`);
  }
}

// --- AppUp Flow ---
{
  apply('appup-flow', 'en', {
    name: 'App-Up Flow',
    short: 'A timeline view of how your day flows across apps.',
    full: `App-Up Flow shows your day as a flow of app use. Spot streaks, gaps, and the apps that pull you back in.\n\nBuilt for reflection—not gamified streaks for their own sake.`,
  });
  apply('appup-flow', 'es', {
    name: 'App-Up Flow',
    short: 'Una línea de tiempo del flujo de tus apps.',
    full: `App-Up Flow muestra tu día como un flujo de uso de apps. Detecta rachas, pausas y las apps que te vuelven a atraer.\n\nHecha para reflexionar, no para competir contigo mismo.`,
  });
  apply('appup-flow', 'zh', {
    name: 'App-Up Flow',
    short: '用时间线看清一天的应用流动。',
    full: `App-Up Flow 把一天的应用使用画成流动时间线。看见连续使用、空隙，以及把你拉回去的应用。\n\n为反思而做，不是为刷成就。`,
  });
  log.push('appup-flow: drafted en/es/zh');
}

// --- Men's Cycle (from HP JA + EN summary; draft ES/ZH) ---
{
  const ja = read(path.join(WORKS, 'mens-cycle.mdoc')).replace(/^---[\s\S]*?---\s*/, '');
  apply('mens-cycle', 'en', {
    name: "Men's Cycle",
    short: 'A private habit tracker for self-discipline and reflection.',
    full: `Men's Cycle helps you log condition and habits, and review abstinence (charge) progress on a calendar and charts.\n\nWhat you can do\n• Quick logging and calendar view\n• Charge streak / trends and partner insights\n• Optional passcode lock on launch\n• Guest mode (this device) or sign-in for cloud sync\n\nWorks without an account. Sign in with Google or email to keep data across devices.`,
  });
  apply('mens-cycle', 'es', {
    name: "Men's Cycle",
    short: 'Diario privado de hábitos y autocontrol.',
    full: `Men's Cycle te ayuda a registrar tu estado y hábitos, y a revisar el progreso de abstinencia (carga) en calendario y gráficos.\n\nQué puedes hacer\n• Registro rápido y calendario\n• Rachas / tendencias y análisis\n• Bloqueo opcional con código al abrir\n• Modo invitado (este dispositivo) o inicio de sesión con sincronización\n\nFunciona sin cuenta. Con Google o correo puedes conservar los datos al cambiar de móvil.`,
  });
  apply('mens-cycle', 'zh', {
    name: "Men's Cycle",
    short: '私密的习惯与自律记录工具。',
    full: `Men's Cycle 用于记录状态与习惯，并用日历、图表回顾禁欲（充能）进度。\n\n功能\n・快速记录与日历\n・充能天数／趋势与对象分析\n・可选启动密码锁定\n・访客（仅本机）或登录云同步\n\n无需账号即可使用。用 Google 或邮箱登录后可在换机后延续数据。`,
  });
  log.push('mens-cycle: drafted en/es/zh');
}

// --- AWAYER ---
{
  const parsed = parseAwayer(read(path.join(ROOT, 'AWAYER', 'store', 'appstore', 'LISTING.md')));
  apply('awayer', 'en', parsed.en);
  apply('awayer', 'es', {
    name: 'AWAYER',
    short: 'Registro de estadios de la J.League.',
    full: `Colecciona los estadios.\n\nAWAYER es un diario personal de visitas a estadios de la J.League. Victorias, lluvias a domicilio y cada césped en el que estuviste quedan en tu mapa.\n\nDeja el día donde ocurrió. Abre un pin y añade fecha, partido, nota y hasta 3 fotos. Cada nueva visita se suma.\n\nEl mapa se vuelve tu cuaderno de viajes. Los estadios visitados se encienden con los colores del club.\n\nLos registros se quedan en este dispositivo. Sin cuenta.`,
  });
  apply('awayer', 'zh', {
    name: 'AWAYER',
    short: 'J联赛球场远征记录。',
    full: `收集球场。\n\nAWAYER 是记录 J 联赛球场到访的远征账。胜利日、雨中客场，你站过的场地都会留在地图上。\n\n在地点留下那一天：打开图钉，添加日期、比赛、备注，最多 3 张照片。再去就再记一次。\n\n地图变成你的远征账。到访球场会以俱乐部颜色点亮。\n\n记录只保存在本机，无需账号。`,
  });
  log.push('awayer: en + drafted es/zh');
}

// --- BodyLine AI ---
{
  const parsed = parseBodyLine(read(path.join(ROOT, 'BodyLine AI', 'store', 'listing.md')));
  apply('bodyline-ai', 'en', parsed.en);
  apply('bodyline-ai', 'es', {
    name: 'BodyLine AI',
    short: 'Foto del cuerpo para medir progreso vs ideal. Privado en el dispositivo.',
    full: `BodyLine AI registra el progreso corporal a partir de fotos y te ayuda a seguir tu silueta ideal.\n\n• Foto para comparar con la vez anterior y tu ideal\n• Puntuación por zonas\n• Historial Before / After\n• Timelapse a la galería\n• Sin login — exporta / importa\n• Fotos y análisis en el dispositivo`,
  });
  apply('bodyline-ai', 'zh', {
    name: 'BodyLine AI',
    short: '拍身体照片记录达成度，对照上次与理想。数据保存在本机。',
    full: `BodyLine AI 根据身体照片记录达成度，并对照上次与理想体型。\n\n・拍照分析与上次／理想的差异\n・按部位显示达成度\n・历史 Before／After 对比\n・延时摄影保存到相册\n・无需登录，可导出／导入\n・照片与分析保存在本机`,
  });
  for (const lang of ['en']) {
    const n = copyShots('bodyline-ai', lang, path.join(ROOT, 'BodyLine AI', 'store', 'play', 'final', lang));
    appendShotMarkdown('bodyline-ai', lang);
    log.push(`bodyline-ai/${lang} shots+=${n}`);
  }
  const nJa = copyShots('bodyline-ai', 'ja', path.join(ROOT, 'BodyLine AI', 'store', 'play', 'final'));
  log.push(`bodyline-ai/ja shots+=${nJa}`);
}

// --- EuroScore / ChinaScore / pennant / statescore ---
{
  const euro = parseEuro(read(path.join(ROOT, 'EuroScore', 'Store', 'appstore', 'listing.txt')));
  apply('euroscore', 'en', euro);
  apply('euroscore', 'es', {
    name: 'EuroScore',
    short: 'Cincuenta y cinco países. Un solo registro.',
    full: `Persigue los 275.\n\nEuroScore es un diario de carretera para las 55 asociaciones de la UEFA. Cada país que alcanzas entra en un mapa y en una puntuación.\n\nVivir allí es 5. Una noche es 4. Una parada real es 3. Cruzar a pie es 2. De paso es 1. Sin explorar queda en 0.\n\nTus notas y fotos se quedan en este dispositivo.`,
  });
  apply('euroscore', 'zh', {
    name: 'EuroScore',
    short: '五十五个国家，一本路书。',
    full: `冲向 275 分。\n\nEuroScore 是面向 UEFA 55 个协会成员的旅行记录。你到过的每个国家都记入一张地图和一个总分。\n\n长住 5 分，过夜 4 分，停留 3 分，进入 2 分，路过 1 分，未去 0 分。\n\n备注与照片保存在本机。`,
  });

  const china = parseChina(read(path.join(ROOT, 'ChinaScore', 'store', 'play', 'listing.txt')));
  apply('chinascore', 'zh', china);
  apply('chinascore', 'en', {
    name: 'ChinaScore',
    short: 'A China travel log. Score each place 0–5 and light your map.',
    full: `ChinaScore is a travel log for China.\n\nScore each place from 0 to 5. The sum is your total out of 155. Map, notes, and photos stay on this device—no account.\n\nScoring\n• Lived there — 5\n• Overnight — 4\n• Stopped — 3\n• Entered — 2\n• Passed through — 1\n• Not yet — 0\n\nThree map modes: color, mono, and photo-in-shape. Add season, year, a note, and one photo per place.`,
  });
  apply('chinascore', 'es', {
    name: 'ChinaScore',
    short: 'Diario de viaje por China. Puntúa 0–5 y enciende el mapa.',
    full: `ChinaScore es un diario de viaje por China.\n\nPuntúa cada lugar de 0 a 5. La suma es tu total sobre 155. Mapa, notas y fotos se quedan en el dispositivo, sin cuenta.`,
  });

  const pennant = parsePennant(read(path.join(ROOT, 'プロ野球順位予想アプリ', 'store', 'appstore', 'listing.txt')));
  // JA already in site; draft EN/ES/ZH
  apply('pennant-penalty', 'en', {
    name: 'Pennant Penalty',
    short: 'Count how far NPB rank predictions miss.',
    full: `Predict the final order of Japan’s 12 NPB teams before the season. Central and Pacific leagues, 1st through 6th.\n\nAs the season progresses, the app counts the gap between your prediction and the real standings. The total gap is your penalty—0 is a perfect match.\n\nHome shows combined and per-league gaps. Charts track movement. Share a result image. Data stays on device with export/import. Not an official NPB app.`,
  });
  apply('pennant-penalty', 'es', {
    name: 'Pennant Penalty',
    short: 'Mide el error de tu predicción de clasificación NPB.',
    full: `Predice el orden final de los 12 equipos de la NPB. Ligas Central y del Pacífico, del 1.º al 6.º.\n\nDurante la temporada se cuenta la diferencia con la clasificación real. El total es tu penalización: 0 es acierto perfecto.\n\nDatos en el dispositivo. No es una app oficial de la NPB.`,
  });
  apply('pennant-penalty', 'zh', {
    name: 'ペナントペナルティ',
    short: '统计日职棒排名预测与实际的偏差。',
    full: `在赛季前预测日本职棒 12 支球队的最终排名（央联／洋联各 1–6 名）。\n\n赛季进行中会累计预测与实际排名的差距，总和即罚分；0 为完全猜中。\n\n数据保存在本机。非 NPB 官方应用。`,
  });

  apply('statescore', 'en', {
    name: 'StateScore',
    short: 'Fifty states. One travel score.',
    full: `StateScore is a USA travel log. Score each state from 0 to 5, light your map, add notes and photos. Everything stays on this device.`,
  });
  apply('statescore', 'es', {
    name: 'StateScore',
    short: 'Cincuenta estados. Una puntuación de viaje.',
    full: `StateScore es un diario de viaje por EE. UU. Puntúa cada estado de 0 a 5, enciende el mapa, añade notas y fotos. Todo se queda en el dispositivo.`,
  });
  apply('statescore', 'zh', {
    name: 'StateScore',
    short: '五十个州，一本美国旅行分数。',
    full: `StateScore 是美国旅行记录。给各州打 0–5 分，点亮地图，添加备注与照片。数据保存在本机。`,
  });
}

// --- camerepo / illust / chain-quest from HP JA + drafts ---
{
  const cam = read(path.join(WORKS, 'camerepo.mdoc')).replace(/^---[\s\S]*?---\s*/, '');
  apply('camerepo', 'en', {
    name: 'CameRepo',
    short: 'A web map for sharing stink bug sightings.',
    full: `CameRepo is a web map for sharing and checking stink bug (kamemushi) sightings.\n\n${cam.slice(0, 500)}`,
  });
  apply('camerepo', 'es', {
    name: 'CameRepo',
    short: 'Mapa web para avistamientos de chinches hediondas.',
    full: `CameRepo es un mapa web para compartir y consultar avistamientos de chinches (kamemushi).`,
  });
  apply('camerepo', 'zh', {
    name: 'カメレポ',
    short: '分享与查看椿象出现情况的网页地图。',
    full: `カメレポ（CameRepo）是用于分享、查看椿象出现情况的网页地图服务。`,
  });

  apply('illust-michiannai', 'en', {
    name: 'Illustrated Directions',
    short: 'Turn a route into a simple illustrated guide.',
    full: `Illustrated Directions helps turn a path into a friendly illustrated wayfinding guide—useful for events, shops, and local walks.`,
  });
  apply('illust-michiannai', 'es', {
    name: 'Guía ilustrada',
    short: 'Convierte una ruta en una guía ilustrada sencilla.',
    full: `Guía ilustrada convierte un recorrido en un mapa amable para eventos, tiendas y paseos locales.`,
  });
  apply('illust-michiannai', 'zh', {
    name: '插画向导',
    short: '把路线做成简单易懂的插画导航。',
    full: `插画向导把路线做成亲切的插画指引，适合活动、店铺与本地散步。`,
  });

  apply('chain-quest', 'en', {
    name: 'Chain Store Quest',
    short: 'A playful quest around chain-store spotting.',
    full: `Chain Store Quest turns everyday chain stores into a light collection / quest experience.`,
  });
  apply('chain-quest', 'es', {
    name: 'Chain Store Quest',
    short: 'Una búsqueda ligera de cadenas de tiendas.',
    full: `Chain Store Quest convierte las cadenas de siempre en una colección / misión ligera.`,
  });
  apply('chain-quest', 'zh', {
    name: '连锁店任务',
    short: '围绕连锁店打卡的轻松任务。',
    full: `连锁店任务把日常连锁店变成轻松的收集／任务体验。`,
  });
}

console.log(log.join('\n'));
console.log('remaining import done');
