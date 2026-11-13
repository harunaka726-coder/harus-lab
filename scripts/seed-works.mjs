import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/content/works');
fs.mkdirSync(dir, { recursive: true });

const works = [
  { slug: 'mens-cycle', title: "Men's Cycle", titleEn: "Men's Cycle", order: 1, status: 'wip', category: 'life', platforms: ['ios', 'android'], summary: 'オナ禁・習慣を記録して振り返るためのプライベート管理アプリ。', summaryEn: 'A private habit tracker focused on self-discipline and reflection.', featured: false },
  { slug: 'logroom', title: 'LogRoom', titleEn: 'LogRoom', order: 2, status: 'preview', category: 'life', platforms: ['ios', 'android', 'web'], summary: '部屋の写真から片付け度合いをAIが点数化する、片付けの可視化ツール。', summaryEn: 'Photograph a room and get an AI score for how tidy it looks.', featured: true },
  { slug: 'statescore', title: 'StateScore', titleEn: 'StateScore', order: 3, status: 'preview', category: 'map', platforms: ['ios', 'android'], summary: '訪れたアメリカの州を記録して、自分の旅の地図をつくるアプリ。', summaryEn: 'Log the U.S. states you have visited and build your personal map.', featured: false },
  { slug: 'awayer', title: 'AWAYER', titleEn: 'AWAYER', order: 4, status: 'preview', category: 'map', platforms: ['ios', 'android'], summary: 'Jリーグのスタジアム訪問を記録する、サッカー好きのための旅メモ。', summaryEn: "Track stadium visits across Japan's J.League.", featured: true },
  { slug: 'pennant-penalty', title: 'ペナントペナルティ', titleEn: 'Pennant Penalty', order: 5, status: 'wip', category: 'play', platforms: ['ios', 'android'], summary: 'プロ野球の順位を予想して楽しむ、シーズン通して遊べるアプリ。', summaryEn: 'Predict NPB standings and follow your forecasts through the season.', featured: false },
  { slug: 'appup', title: 'AppUp', titleEn: 'AppUp', order: 6, status: 'preview', category: 'life', platforms: ['ios', 'android'], summary: 'スマホのアプリ使用時間をわかりやすく可視化するツール。', summaryEn: 'Visualize how much time you spend in each smartphone app.', featured: false },
  { slug: 'appup-home', title: 'AppUp Home', titleEn: 'AppUp Home', order: 7, status: 'wip', category: 'life', platforms: ['android'], summary: '使用時間に応じてホーム画面のアイコンサイズが変わるランチャー。', summaryEn: 'A launcher where icon size grows with app usage time.', featured: false },
  { slug: 'euroscore', title: 'EuroScore', titleEn: 'EuroScore', order: 8, status: 'wip', category: 'map', platforms: ['ios', 'android'], summary: 'ヨーロッパの国々の訪問記録を残す、StateScoreの欧州版。', summaryEn: 'StateScore for Europe — log countries you have visited.', featured: false },
  { slug: 'chinascore', title: 'ChinaScore', titleEn: 'ChinaScore', order: 9, status: 'wip', category: 'map', platforms: ['ios', 'android'], summary: '中国の省・地域の訪問を記録するマップ系アプリ。', summaryEn: 'Log visits across provinces and regions in China.', featured: false },
  { slug: 'time-capsule-quiz', title: 'Time Capsule Quiz', titleEn: 'Time Capsule Quiz', order: 10, status: 'preview', category: 'play', platforms: ['ios', 'android'], summary: 'スマホの写真アルバムからクイズをつくり、思い出で遊ぶアプリ。', summaryEn: 'Turn your camera roll into a personal quiz about your memories.', featured: true },
  { slug: 'bodyline-ai', title: 'BodyLine AI', titleEn: 'BodyLine AI', order: 11, status: 'wip', category: 'life', platforms: ['ios', 'android'], summary: '身体の写真をもとにAIがラインやバランスを採点する実験アプリ。', summaryEn: 'An experimental AI scorer for body-line photos.', featured: false },
  { slug: 'camerepo', title: 'カメレポ', titleEn: 'CameRepo', order: 12, status: 'preview', category: 'map', platforms: ['web'], summary: 'カメムシの発生状況を地図で共有・確認できるウェブサービス。', summaryEn: 'A web map for sharing and checking stink bug sightings.', featured: true },
  { slug: 'illust-michiannai', title: 'イラスト道案内', titleEn: 'Illustrated Directions', order: 13, status: 'preview', category: 'creative', platforms: ['web'], summary: '雑誌のようなイラスト地図を自分で作れる道案内ウェブサービス。', summaryEn: 'Create magazine-like illustrated maps for giving directions.', featured: true },
  { slug: 'chain-quest', title: 'チェーン店クエスト', titleEn: 'Chain Store Quest', order: 14, status: 'preview', category: 'play', platforms: ['web'], summary: '地図上のチェーン店を結んで歩く／遊ぶ、街歩きウェブサービス。', summaryEn: 'Connect chain stores on a map and turn the city into a quest.', featured: false },
  { slug: 'appup-flow', title: 'AppUp Flow', titleEn: 'AppUp Flow', order: 15, status: 'wip', category: 'life', platforms: ['ios', 'android'], summary: 'アプリ使用時間をタイムラインで眺める可視化アプリ。', summaryEn: 'See app usage as a flowing timeline.', featured: false },
  { slug: 'annoying-ninja', title: 'AnnoyingNinja', titleEn: 'AnnoyingNinja', order: 16, status: 'wip', category: 'play', platforms: ['android'], summary: '使用時間に合わせて分身が増える、ホーム画面の忍者Shimeji。', summaryEn: 'Home-screen ninjas that multiply with your screen time.', featured: false },
  { slug: 'mirrornote', title: 'MirrorNote', titleEn: 'MirrorNote', order: 17, status: 'wip', category: 'play', platforms: ['ios', 'android'], summary: '鏡文字でメモを書ける、ちょっと変わったメモ帳アプリ。', summaryEn: 'A notepad that writes in mirrored letters.', featured: false },
  { slug: 'dare-dakke', title: '誰だっけ', titleEn: 'Who Was That', order: 18, status: 'wip', category: 'play', platforms: ['ios', 'android'], summary: '写真アルバムから顔を集めて「誰だっけ？」と遊ぶアプリ。', summaryEn: 'Pull faces from your album and play a who-is-who game.', featured: false },
  { slug: 'shinkanji', title: 'シン漢字メーカー', titleEn: 'Original Kanji Maker', order: 19, status: 'released', category: 'creative', platforms: ['ios', 'android', 'web'], summary: '部首とパーツを組み合わせて、世界にひとつだけの漢字をつくる。', summaryEn: 'Combine radicals and parts to invent original Japanese characters.', featured: true },
  { slug: 'goo-choki-paa', title: 'グーチョキパーでなにつくろう', titleEn: 'Rock-Paper-Scissors Builder', order: 20, status: 'wip', category: 'creative', platforms: ['ios', 'android', 'web'], summary: 'グー・チョキ・パーの3Dモデルを画面上で組み合わせて遊ぶ。', summaryEn: 'Combine 3D rock-paper-scissors models on screen.', featured: false },
];

for (const w of works) {
  const body = `---
title: ${JSON.stringify(w.title)}
titleEn: ${JSON.stringify(w.titleEn)}
order: ${w.order}
status: ${w.status}
category: ${w.category}
platforms:
${w.platforms.map((p) => `  - ${p}`).join('\n')}
summary: ${JSON.stringify(w.summary)}
summaryEn: ${JSON.stringify(w.summaryEn)}
featured: ${w.featured}
---

${w.summary}
`;
  fs.writeFileSync(path.join(dir, `${w.slug}.mdoc`), body);
}

console.log(`wrote ${works.length} works`);
