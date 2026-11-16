export type Lang = 'ja' | 'en' | 'es' | 'zh';

export const languages: Record<Lang, string> = {
  ja: '日本語',
  en: 'ENGLISH',
  es: 'ESPAÑOL',
  zh: '中文簡体',
};

export const langCodes: Lang[] = ['ja', 'en', 'es', 'zh'];

export const defaultLang: Lang = 'ja';

const ui = {
  ja: {
    siteName: "Haru's Lab",
    tagline: '小さなアイデアを、形にする',
    navWorks: 'Works',
    navBlog: 'Blog',
    navAbout: 'About',
    navContact: 'Contact',
    navHome: 'Home',
    ctaWorks: 'Works を見る',
    ctaBlog: 'ブログを読む',
    featuredWorks: 'Works',
    othersWorks: 'Others',
    latestBlog: 'Latest Notes',
    allWorks: 'すべての Works',
    allPosts: '記事一覧',
    readMore: '続きを読む',
    statusReleased: '公開中',
    statusPreview: 'プレビュー',
    statusWip: '開発中',
    categoryLife: '生活・記録',
    categoryMap: '地図・旅',
    categoryCreative: 'クリエイティブ',
    categoryPlay: '実験・遊び',
    platforms: '対応：　',
    links: 'リンク',
    aboutTitle: 'About',
    contactTitle: 'Contact',
    contactLead: 'ご連絡・ご相談はこちらからどうぞ。',
    contactButton: '送信する',
    contactName: 'お名前',
    contactEmail: 'メールアドレス',
    contactMessage: 'メッセージ',
    contactSubmit: '送信する',
    contactSuccess: '送信しました。ありがとうございます。',
    contactError: '送信に失敗しました。時間をおいて再度お試しください。',
    privacyTitle: 'プライバシーポリシー',
    footerNote: 'note',
    footerPrivacy: 'Privacy',
    footerSocial: 'Social（準備中）',
    noteCredit: '原文（note）',
    filterAll: 'すべて',
    emptyBlog: '記事はまだありません。',
    workDetail: '作品詳細',
    screenshots: 'スクリーンショット',
    heroKicker: 'Indie works & experiments',
  },
  en: {
    siteName: "Haru's Lab",
    tagline: 'Shaping small ideas into form.',
    navWorks: 'Works',
    navBlog: 'Blog',
    navAbout: 'About',
    navContact: 'Contact',
    navHome: 'Home',
    ctaWorks: 'Browse works',
    ctaBlog: 'Read the blog',
    featuredWorks: 'Works',
    othersWorks: 'Others',
    latestBlog: 'Latest Notes',
    allWorks: 'All works',
    allPosts: 'All posts',
    readMore: 'Read more',
    statusReleased: 'Released',
    statusPreview: 'Preview',
    statusWip: 'In progress',
    categoryLife: 'Life & logging',
    categoryMap: 'Maps & travel',
    categoryCreative: 'Creative',
    categoryPlay: 'Experiments',
    platforms: 'Platforms: ',
    links: 'Links',
    aboutTitle: 'About',
    contactTitle: 'Contact',
    contactLead: 'Questions or collaboration — reach out here.',
    contactButton: 'Send',
    contactName: 'Name',
    contactEmail: 'Email',
    contactMessage: 'Message',
    contactSubmit: 'Send message',
    contactSuccess: 'Sent. Thank you!',
    contactError: 'Could not send. Please try again later.',
    privacyTitle: 'Privacy Policy',
    footerNote: 'note',
    footerPrivacy: 'Privacy',
    footerSocial: 'Social (coming soon)',
    noteCredit: 'Original on note',
    filterAll: 'All',
    emptyBlog: 'No posts yet.',
    workDetail: 'Work detail',
    screenshots: 'Screenshots',
    heroKicker: 'Indie works & experiments',
  },
  es: {
    siteName: "Haru's Lab",
    tagline: 'Dar forma a pequeñas ideas.',
    navWorks: 'Works',
    navBlog: 'Blog',
    navAbout: 'About',
    navContact: 'Contact',
    navHome: 'Home',
    ctaWorks: 'Ver trabajos',
    ctaBlog: 'Leer el blog',
    featuredWorks: 'Works',
    othersWorks: 'Others',
    latestBlog: 'Últimas notas',
    allWorks: 'Todos los trabajos',
    allPosts: 'Todas las entradas',
    readMore: 'Leer más',
    statusReleased: 'Publicado',
    statusPreview: 'Vista previa',
    statusWip: 'En progreso',
    categoryLife: 'Vida y registro',
    categoryMap: 'Mapas y viajes',
    categoryCreative: 'Creativo',
    categoryPlay: 'Experimentos',
    platforms: 'Plataformas: ',
    links: 'Enlaces',
    aboutTitle: 'About',
    contactTitle: 'Contact',
    contactLead: 'Consultas o colaboración — escríbeme aquí.',
    contactButton: 'Enviar',
    contactName: 'Nombre',
    contactEmail: 'Correo',
    contactMessage: 'Mensaje',
    contactSubmit: 'Enviar mensaje',
    contactSuccess: 'Enviado. ¡Gracias!',
    contactError: 'No se pudo enviar. Inténtalo más tarde.',
    privacyTitle: 'Política de privacidad',
    footerNote: 'note',
    footerPrivacy: 'Privacy',
    footerSocial: 'Social (próximamente)',
    noteCredit: 'Original en note',
    filterAll: 'Todo',
    emptyBlog: 'Aún no hay entradas.',
    workDetail: 'Detalle',
    screenshots: 'Capturas',
    heroKicker: 'Indie works & experiments',
  },
  zh: {
    siteName: "Haru's Lab",
    tagline: '把小小的想法做成形状。',
    navWorks: 'Works',
    navBlog: 'Blog',
    navAbout: 'About',
    navContact: 'Contact',
    navHome: 'Home',
    ctaWorks: '查看作品',
    ctaBlog: '阅读博客',
    featuredWorks: 'Works',
    othersWorks: 'Others',
    latestBlog: '最新笔记',
    allWorks: '全部作品',
    allPosts: '全部文章',
    readMore: '阅读更多',
    statusReleased: '已发布',
    statusPreview: '预览',
    statusWip: '制作中',
    categoryLife: '生活与记录',
    categoryMap: '地图与旅行',
    categoryCreative: '创作',
    categoryPlay: '实验',
    platforms: '支持：',
    links: '链接',
    aboutTitle: 'About',
    contactTitle: 'Contact',
    contactLead: '咨询或合作，欢迎留言。',
    contactButton: '发送',
    contactName: '姓名',
    contactEmail: '邮箱',
    contactMessage: '留言',
    contactSubmit: '发送',
    contactSuccess: '已发送，谢谢！',
    contactError: '发送失败，请稍后再试。',
    privacyTitle: '隐私政策',
    footerNote: 'note',
    footerPrivacy: 'Privacy',
    footerSocial: 'Social（准备中）',
    noteCredit: '原文（note）',
    filterAll: '全部',
    emptyBlog: '暂无文章。',
    workDetail: '作品详情',
    screenshots: '截图',
    heroKicker: 'Indie works & experiments',
  },
} as const;

export type UiKey = keyof (typeof ui)['ja'];

export function t(lang: Lang, key: UiKey): string {
  return ui[lang][key] ?? ui.en[key] ?? ui.ja[key];
}

export function isLang(value: string | undefined): value is Lang {
  return value === 'ja' || value === 'en' || value === 'es' || value === 'zh';
}

export function getLangFromUrl(url: URL): Lang {
  const [, maybe] = url.pathname.split('/');
  if (isLang(maybe) && maybe !== 'ja') return maybe;
  return 'ja';
}

/** Path without locale prefix and without trailing slash (except `/`). */
export function stripLangPrefix(pathname: string): string {
  const parts = pathname.split('/');
  const maybe = parts[1];
  const rest =
    isLang(maybe) && maybe !== 'ja' ? '/' + parts.slice(2).join('/') : pathname;
  if (rest === '/' || rest === '') return '/';
  return rest.replace(/\/$/, '') || '/';
}

function withTrailingSlash(path: string): string {
  if (path === '/' || path === '') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

/** Locale-aware href that always ends with `/` (matches Cloudflare Pages). */
export function localizedPath(lang: Lang, path: string): string {
  const clean = (path.startsWith('/') ? path : `/${path}`).replace(/\/$/, '') || '/';
  if (lang === 'ja') return withTrailingSlash(clean);
  if (clean === '/') return withTrailingSlash(`/${lang}`);
  return withTrailingSlash(`/${lang}${clean}`);
}

export function worksAnchor(lang: Lang): string {
  return lang === 'ja' ? '/#works' : `/${lang}/#works`;
}
