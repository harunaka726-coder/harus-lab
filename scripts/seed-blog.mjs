import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/content/blog');
fs.mkdirSync(dir, { recursive: true });

const posts = [
  {
    slug: 'why-indie-apps',
    title: '個人開発を続ける理由',
    titleEn: 'Why I keep building indie apps',
    date: '2026-03-01',
    excerpt: 'おもしろいアイデアを、小さくても形にする。個人開発を続けている理由をまとめました。',
    excerptEn: 'Notes on why I keep turning small ideas into apps.',
    noteUrl: 'https://note.com/nice_acacia5247',
    body: `おもしろいアイデアは、考えているだけでは消えていきます。

私は「おもしろアイデア、便利なアプリ、自己啓発」を軸に、Cursor を使いながら個人開発を続けています。完成度より、まず触れるものを出す。その積み重ねが、次のアイデアを連れてくるように感じています。

このサイトでは、つくったアプリやウェブサービスの紹介と、制作の途中で考えたことを書いていきます。

原文は Note にも残していますが、今後はこちらを主な発信の場にしていく予定です。
`,
  },
  {
    slug: 'from-note-to-home',
    title: 'Noteからホームページへ',
    titleEn: 'From Note to a personal homepage',
    date: '2026-04-10',
    excerpt: 'Noteで書いてきた文章を、自分の場所に少しずつ移していきます。',
    excerptEn: 'Moving writing from Note onto a home of my own.',
    noteUrl: 'https://note.com/nice_acacia5247',
    body: `しばらく Note に文章を置いてきました。読みやすさはある一方で、作品一覧やプライバシーポリシーなど、サイトとしての土台は別途必要だと感じていました。

そこで、Haru Nakajima としてのホームページをつくることにしました。ブログは Note の転記から始め、アプリやウェブサービスの入口もここに集めます。

移住の話も、個人開発の話も、同じ場所で読めるようにしていく予定です。
`,
  },
  {
    slug: 'small-tools-big-curiosity',
    title: '小さなツールと大きな好奇心',
    titleEn: 'Small tools, big curiosity',
    date: '2026-05-20',
    excerpt: 'カメレポもイラスト道案内も、日常の「あったらいいな」から始まっています。',
    excerptEn: 'CameRepo and illustrated maps started as everyday “what if” ideas.',
    noteUrl: 'https://note.com/nice_acacia5247',
    body: `大きなプラットフォームを狙う前に、自分が欲しい小さな道具をつくる。

カメムシの発生を地図で見たい。道案内を雑誌の挿絵みたいにしたい。漢字の部首で遊んでみたい。どれも、日常の好奇心がそのままプロトタイプになっています。

完成していないものも含めて Works に並べるのは、過程も作品の一部だと思うからです。
`,
  },
];

for (const p of posts) {
  const body = `---
title: ${JSON.stringify(p.title)}
titleEn: ${JSON.stringify(p.titleEn)}
date: ${p.date}
excerpt: ${JSON.stringify(p.excerpt)}
excerptEn: ${JSON.stringify(p.excerptEn)}
noteUrl: ${JSON.stringify(p.noteUrl)}
lang: ja
---

${p.body.trim()}
`;
  fs.writeFileSync(path.join(dir, `${p.slug}.mdoc`), body);
}

console.log(`wrote ${posts.length} posts`);
