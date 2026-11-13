import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/content/works');
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.mdoc')) continue;
  const full = path.join(dir, file);
  let text = fs.readFileSync(full, 'utf8');
  if (!/^imageColumns:/m.test(text)) {
    text = text.replace(/^gallery:.*$/m, (m) => `${m}\nimageColumns: "2"`);
    fs.writeFileSync(full, text);
  }
}
console.log('imageColumns defaults added');
