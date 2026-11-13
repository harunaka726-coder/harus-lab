import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title (JA)' } }),
        titleEn: fields.text({ label: 'Title (EN)', validation: { isRequired: false } }),
        date: fields.date({ label: 'Date' }),
        excerpt: fields.text({ label: 'Excerpt (JA)', multiline: true }),
        excerptEn: fields.text({ label: 'Excerpt (EN)', multiline: true, validation: { isRequired: false } }),
        noteUrl: fields.url({ label: 'Original Note URL', validation: { isRequired: false } }),
        lang: fields.select({
          label: 'Primary language',
          options: [
            { label: 'Japanese', value: 'ja' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'ja',
        }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
    works: collection({
      label: 'Works',
      slugField: 'title',
      path: 'src/content/works/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title (JA)' } }),
        titleEn: fields.text({ label: 'Title (EN)' }),
        titleEs: fields.text({ label: 'Title (ES)', validation: { isRequired: false } }),
        titleZh: fields.text({ label: 'Title (ZH)', validation: { isRequired: false } }),
        order: fields.integer({ label: 'Order', defaultValue: 1 }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Released', value: 'released' },
            { label: 'Preview', value: 'preview' },
            { label: 'WIP', value: 'wip' },
          ],
          defaultValue: 'wip',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: '生活・記録', value: 'life' },
            { label: '地図・旅', value: 'map' },
            { label: 'クリエイティブ', value: 'creative' },
            { label: '実験・遊び', value: 'play' },
          ],
          defaultValue: 'play',
        }),
        platforms: fields.array(
          fields.select({
            label: 'Platform',
            options: [
              { label: 'iOS', value: 'ios' },
              { label: 'Android', value: 'android' },
              { label: 'Web', value: 'web' },
            ],
            defaultValue: 'ios',
          }),
          { label: 'Platforms', itemLabel: (props) => props.value },
        ),
        summary: fields.text({ label: 'Summary (JA)', multiline: true }),
        summaryEn: fields.text({ label: 'Summary (EN)', multiline: true }),
        summaryEs: fields.text({ label: 'Summary (ES)', multiline: true, validation: { isRequired: false } }),
        summaryZh: fields.text({ label: 'Summary (ZH)', multiline: true, validation: { isRequired: false } }),
        featured: fields.checkbox({ label: 'Featured on home', defaultValue: false }),
        gallery: fields.select({
          label: 'Gallery section',
          options: [
            { label: 'Featured (large icons)', value: 'featured' },
            { label: 'Others (compact list)', value: 'others' },
          ],
          defaultValue: 'others',
        }),
        icon: fields.image({
          label: 'App icon',
          directory: 'public/icons',
          publicPath: '/icons/',
        }),
        screenshots: fields.array(
          fields.image({
            label: 'Screenshot',
            directory: 'public/screenshots',
            publicPath: '/screenshots/',
          }),
          {
            label: 'Screenshots',
            itemLabel: (props) => (typeof props.value === 'string' ? props.value : 'screenshot'),
          },
        ),
        imageColumns: fields.select({
          label: 'Images per row (screenshots & body images)',
          options: [
            { label: '1 per row', value: '1' },
            { label: '2 per row', value: '2' },
            { label: '3 per row', value: '3' },
          ],
          defaultValue: '2',
        }),
        appStore: fields.url({ label: 'App Store URL', validation: { isRequired: false } }),
        playStore: fields.url({ label: 'Play Store URL', validation: { isRequired: false } }),
        webUrl: fields.url({ label: 'Web URL', validation: { isRequired: false } }),
        content: fields.markdoc({ label: 'Detail / long description (JA)' }),
        contentEn: fields.markdoc({ label: 'Detail / long description (EN)' }),
        contentEs: fields.markdoc({ label: 'Detail / long description (ES)' }),
        contentZh: fields.markdoc({ label: 'Detail / long description (ZH)' }),
      },
    }),
  },
});
