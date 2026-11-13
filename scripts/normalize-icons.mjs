import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/content/works');
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.mdoc')) continue;
  const full = path.join(dir, file);
  let text = fs.readFileSync(full, 'utf8');
  text = text.replace(/^icon:\s*"\/icons\/([^"]+)"/m, 'icon: "$1"');
  fs.writeFileSync(full, text);
}
console.log('normalized icon filenames');
