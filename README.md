# Haru Nakajima — Personal Homepage

Magazine-toned personal site for Works, Blog, About, Contact, and Privacy.

## Commands

```bash
npm run dev      # http://localhost:4321  /  Keystatic: /keystatic
npm run build    # static output → dist/
npm run preview  # preview production build
```

## Content

- Works: `src/content/works/*.mdoc`
- Blog: `src/content/blog/*.mdoc`
- Browser CMS (local): open `/keystatic` while `npm run dev` is running
- Seed scripts: `node scripts/seed-works.mjs`, `node scripts/seed-blog.mjs`

## Notes

- Japanese is default (`/`). English lives under `/en/...`
- Contact form URLs are placeholders in `src/pages/contact.astro` (and EN)
- Domain / deploy / AdSense tags are intentionally out of scope for v1
- Planning notes: `docs/question.txt`
