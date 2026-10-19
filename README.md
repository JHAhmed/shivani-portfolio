# shivani-illakiya.com

Portfolio for Shivani Illakiya, journalist and food correspondent at Indulge, The New Indian Express. A fully prerendered SvelteKit site: no server, no CMS, no secrets.

Design spec: `docs/superpowers/specs/2026-10-19-portfolio-redesign-design.md`

## Develop

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # unit tests (content validation, SEO builders)
pnpm build      # prerender to build/, fails on invalid content or broken links
pnpm preview    # serve build/ at http://localhost:4173
```

## Add a story

1. Create `src/content/stories/<slug>/` (the folder name becomes the URL `/stories/<slug>`).
2. Add 1–3 photos (JPG/PNG/WebP, max ~2000px wide) and an optional print `clipping` scan.
3. Write `index.md`:

```markdown
---
title: 'Headline'
dek: 'One-line standfirst (also the search description)'
type: food # food | culture | travel
date: 2026-10-03
venue: 'Rasanai, Chennai' # travel routes as 'MAS → CBE'
publication: 'Indulge, The New Indian Express' # omit for original pieces
sourceUrl: 'https://www.indulgexpress.com/…' # omit for original pieces
fullText: false # true only once republication is cleared
readTime: 10 # optional minutes; set it for excerpts, otherwise it's counted from the text
context: 'Optional 1–3 sentences on how the story was reported.'
featured: true # show on the home page
clipping: ./clipping.jpg # optional
images:
  - {
      src: ./photo-1.jpg,
      alt: 'What the photo shows',
      caption: 'Optional',
      credit: 'Shivani Illakiya'
    }
---

Full text in Markdown. With `fullText: false`, the page shows everything above

<!-- more -->

or the first two paragraphs if there's no marker.
```

`pnpm build` fails with the file and field named if anything is missing or wrong.

**Indexing rule:** a story with `sourceUrl` and `fullText: true` is a republished copy. It gets `noindex, follow` and is left out of the sitemap (Google's guidance for syndicated copies). Excerpts and original stories are indexed.

## Resume

`src/lib/data/profile.js` and `static/Shivani-Illakiya-Resume.pdf` must say the same thing. When one changes, update the other.

## Deploy

- Vercel project with the repo connected; framework preset SvelteKit (adapter-static is zero-config on Vercel).
- Domain `shivani-illakiya.com` is registered at Cloudflare. Add it in Vercel, then create the DNS records Vercel shows, as **DNS only (grey cloud)**. Cloudflare's AI-bot policies only act on proxied traffic, and some of its defaults also block Googlebot.
- In Vercel → Firewall, leave the AI bots ruleset on **Allow** and Bot Protection **Off** (the defaults).
