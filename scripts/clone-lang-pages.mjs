import fs from 'node:fs';
import path from 'node:path';

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function patchLang(dir, lang) {
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.astro')) {
        let text = fs.readFileSync(full, 'utf8');
        text = text.replace(/const lang: Lang = 'en';/g, `const lang: Lang = '${lang}';`);
        text = text.replace(
          /loadWorkContentLocale\(slug, lang, work\.data\.contentEn\)/g,
          `loadWorkContentLocale(slug, lang, work.data.content${lang === 'es' ? 'Es' : lang === 'zh' ? 'Zh' : 'En'})`,
        );
        fs.writeFileSync(full, text);
      }
    }
  };
  walk(dir);
}

const root = path.resolve('src/pages');
const en = path.join(root, 'en');
for (const lang of ['es', 'zh']) {
  const dest = path.join(root, lang);
  fs.rmSync(dest, { recursive: true, force: true });
  copyDir(en, dest);
  patchLang(dest, lang);
  console.log('cloned', lang);
}
