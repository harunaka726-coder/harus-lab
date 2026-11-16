// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';

const isDev = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  site: 'https://harunakajima.com',
  // Keep default `ignore`: `always` breaks Keystatic (/keystatic + /api/keystatic/*).
  // Canonicals/internal links still use trailing slashes via localizedPath().
  integrations: [
    react(),
    markdoc(),
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja',
          en: 'en',
          es: 'es',
          zh: 'zh-Hans',
        },
      },
    }),
    ...(isDev ? [keystatic()] : []),
  ],
});
