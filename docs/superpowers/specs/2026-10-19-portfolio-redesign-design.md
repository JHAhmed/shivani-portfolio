# Shivani Illakiya portfolio redesign: design spec

- **Date:** 2026-10-19
- **Status:** Draft for review
- **Domain:** https://shivani-illakiya.com (registered on Cloudflare, hosted on Vercel)
- **Research reference:** [`docs/research/2026-10-19-llm-seo-and-ats.md`](../../research/2026-10-19-llm-seo-and-ats.md)

## 1. Goal

A portfolio for Shivani Illakiya, a journalist and food correspondent at *Indulge*, The New Indian Express, Chennai. She is applying for jobs now. The site must:

1. Be obvious to navigate for recruiters and editors.
2. Look professional, with an artsy, tactile layer of everyday paper objects.
3. Be fully readable by search engines, LLM-based tools and recruiter tooling: prerendered HTML, structured data, and a plain resume page plus PDF.
4. Be cheap to maintain. Content changes rarely and lives in the repo.

### Non-goals (v1)

- A CMS, or any runtime server or database.
- A clips archive of all her published work. We link to her Indulge author page instead.
- A contact form.
- Dark mode.
- See §11 for the "later" list.

## 2. Decisions log

| # | Decision | Choice |
|---|----------|--------|
| D1 | Structure | Multi-page. Each topic has its own page, and the home page shows short teasers that link to it. |
| D2 | Content source | Hygraph removed. Local Markdown for stories, a JS module for profile and resume data. |
| D3 | Article text | Per-article `fullText` flag. Launch with excerpts where republication permission is unclear, flip to full text later. |
| D4 | Visual direction | Between "travel ephemera" and "pinboard desk": minimal paper base, one paper object per content type. |
| D5 | Card uniformity | Home and listing cards share one size and grid with a single signature detail. Story pages go "full object". |
| D6 | Clips | Featured stories only, plus a link to her Indulge author page. |
| D7 | Motion | "Light delight". No custom cursor; hover lifts, draggable hero decorations on desktop, one load animation, reduced motion respected. |
| D8 | Contact | Email and LinkedIn (Instagram optional). The phone number appears only in the PDF resume. |
| D9 | Content pipeline | Static SvelteKit (`adapter-static`) with a plain Markdown loader (`import.meta.glob` + `gray-matter` + `marked`). Not mdsvex or a content library. |
| D10 | Story header | Simple full-object header (no summary or flip card in v1). |
| D11 | Republished full text | `noindex, follow`, left out of the sitemap, visible link to the original. No cross-domain canonical (per Google's syndication guidance). |
| D12 | AI visibility | No GEO tricks. Text-first prerendered HTML, matching JSON-LD, allow-all robots.txt, llms.txt as a cheap extra. |

## 3. Site map and navigation

| Route | Content |
|-------|---------|
| `/` | Hero (typeset name `<h1>` + one-line positioning, handwritten signature draw, draggable polaroid and sticky notes), featured story cards (3–6), About teaser → `/about`, experience snapshot → `/resume` |
| `/stories` | All stories as uniform cards; Food / Culture / Travel filter chips (all cards are in the HTML and filtering happens in the browser); closing link "See all my published work on Indulge →" |
| `/stories/[slug]` | Full-object header, dek, body (full text or excerpt), 2–3 photos, optional print clipping, "Read on Indulge" link when `sourceUrl` exists |
| `/about` | Longer bio in her voice, beats, portrait and photos |
| `/resume` | The full resume as semantic HTML plus a **Download PDF** button |
| Footer (all pages) | Luggage-tag contact (email, LinkedIn), Indulge author link |
| 404 | "Lost luggage" page with links home and to stories |

**Navigation:** always-visible top bar. Her name on the left links home; **Stories · About · Resume · Contact** on the right ("Contact" scrolls to the footer). On phones the links wrap to a second row. **No hamburger menu.**

The old `/places/*` routes are removed. They were never public, so no redirects.

## 4. Content model

### 4.1 Files

```
src/content/stories/<slug>/index.md   one folder per story; folder name = URL slug
src/content/stories/<slug>/*.jpg      that story's photos + optional clipping scan
src/lib/data/profile.js               resume facts (single source for pages, JSON-LD, llms.txt)
src/lib/data/site.js                  SITE_URL, Indulge author URL, social links
src/lib/server/stories.js             loader (server-only)
static/Shivani-Illakiya-Resume.pdf    downloadable resume
```

### 4.2 Story frontmatter

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | Headline |
| `dek` | yes | One-line standfirst; also the meta description |
| `type` | yes | `food` \| `culture` \| `travel`; picks the paper object |
| `date` | yes | ISO date of publication |
| `images` | yes | 1–3 items `{ src, alt, caption?, credit? }`; `src` is relative to the story folder; `alt` required |
| `venue` | no | Receipt header / ticket venue / boarding-pass route (e.g. `Rasanai, Chennai`, `MAS → YCD`) |
| `publication` | no | e.g. `Indulge, The New Indian Express` |
| `sourceUrl` | no | Original published URL. If absent, the story is original to this site. |
| `fullText` | no | Default `false` when `sourceUrl` is set; forced `true` when it isn't |
| `clipping` | no | Print scan, relative path |
| `context` | no | 1–3 sentences in her own words about the story (how it was reported, why it matters). Rendered after the dek on excerpt pages. Gives excerpt pages original content worth indexing (§7). |
| `featured` | no | `true` shows the story on the home page |

**Computed by the loader:** `slug`, `readTime` (words ÷ 200, rounded up, min 1), `excerpt`, `html`, `indexable`.

**Excerpt rule:** if `fullText` is false, render everything above a `<!-- more -->` marker, or the first two paragraphs when there is no marker. The full text always stays in the file.

**Indexing rule** (from research §5; Google advises against cross-domain canonicals for syndicated copies):

| Story | Canonical | Robots | In sitemap |
|-------|-----------|--------|------------|
| No `sourceUrl` (original to this site) | Self | index | Yes |
| `sourceUrl`, `fullText: false` (excerpt) | Self | index | Yes |
| `sourceUrl`, `fullText: true` (republished copy) | Self | `noindex, follow` | No |

Every story with a `sourceUrl` shows a visible "Originally published in *publication* →" link.

### 4.3 Profile data (`profile.js`)

```js
{
  name, headline, location, email,
  links: { linkedin, instagram?, indulgeAuthor },
  summary,                       // paragraph, matches PDF
  experience: [{ org, role, location, start, end, bullets: [] }],
  education:  [{ institution, degree, location, end }],
  skills:     { tools: [], specialisms: [] }
}
```

The PDF and `profile.js` are both maintained by hand and must say the same thing. This is noted in the README.

### 4.4 Loader (`src/lib/server/stories.js`)

- `import.meta.glob('/src/content/stories/*/index.md', { query: '?raw', import: 'default', eager: true })`
- `import.meta.glob('/src/content/stories/*/*.{jpg,jpeg,png,webp}', { query: { enhanced: true }, import: 'default', eager: true })`
- Parse with `gray-matter` and render the body with `marked`.
- Validate every story. Throw `Error("<slug>/index.md: <field> …")` on a missing required field, unknown `type`, missing `alt`, more than 3 images, an image path that doesn't resolve, or an unparseable date.
- API: `getStories({ type?, featured? })` (newest first), `getStory(slug)` (throws 404 via SvelteKit `error` when missing).
- Used only from `+page.server.js` / `+server.js` files, all prerendered.

## 5. Visual system

### 5.1 Tokens (`app.css` `@theme`)

| Token | Value | Use |
|-------|-------|-----|
| paper | `#f7f4ef` | Page background |
| ink | `#1f1d1a` | Text |
| muted | `#5b554c` | Secondary text |
| receipt | `#fffefb` | Food |
| ticket | `#f6c9b9` | Culture |
| boarding | `#bfe3d6` | Travel accent |
| note | `#fde68a` | Sticky notes |
| tag | `#e9d9b8` | Luggage tag |

The old `--color-primary` / `--color-secondary` (red/lime) are retired. Body text must reach ≥ 4.5:1 contrast on each paper colour; use darker same-hue text where needed.

**Fonts** (self-hosted via `@fontsource`; the Google Fonts `@import` is removed):
- **Urbanist:** all readable text, headings included
- **Caveat:** handwritten notes and polaroid captions only
- **IBM Plex Mono:** ticket and receipt fine print only

### 5.2 Object-per-type rule

| Content | Object | Card signature detail | Story-page header |
|---------|--------|-----------------------|-------------------|
| Food | Restaurant receipt | Zigzag bottom edge, mono line items | Full receipt: venue, date, "served by Shivani Illakiya", read time |
| Culture | Admission ticket stub | Perforated stub | Full ticket: venue, date, serial number |
| Travel | Boarding pass | Route line (`MAS ✈ YCD`) | Full boarding pass: route, date, passenger name |
| Highlights | Sticky note | n/a | n/a |
| Photos | Polaroid | n/a | n/a |
| Contact | Luggage tag | n/a | n/a |

Cards on home and `/stories` share one size and grid (1 → 2 → 3 columns). Rotations are slight (±1.5°) and reduced on phones; nothing may cause horizontal scroll at 375px.

## 6. Components

| Component | Responsibility |
|-----------|----------------|
| `SiteHeader` | Always-visible nav; marks the current page with `aria-current` |
| `SiteFooter` | `LuggageTag` contact + Indulge author link |
| `LuggageTag` | Contact object |
| `StoryCard` | Uniform card; `type` picks the signature detail; whole card is one link labelled "Title — Food story, Oct 2026" |
| `ReceiptHeader`, `TicketHeader`, `BoardingPassHeader` | Full-object story headers, chosen by a `type → component` map |
| `Figure` | `enhanced:img` + caption + credit |
| `Clipping` | Optional print scan with tape; links to the full-size image |
| `Polaroid`, `StickyNote` | Decorations; accept `draggable` |
| `TypeFilter` | Filter chips on `/stories` |
| `Signature` | Handwritten name SVG (from `src/lib/assets/name.svg`) with a one-time DrawSVG animation; `aria-hidden` |
| `Seo` | Title, description, canonical, OG/Twitter, JSON-LD |
| `use:draggable` (action) | GSAP Draggable + Inertia; active only on `(pointer: fine)` with motion allowed; bounded |

### Removed

`Cursor`, `Menu`, `Palette`, `Ticket`, `Sticker`, `Text` (technique kept in `Signature`), both `Navbar`s, `shared/Button`, `state.svelte.js`, `activeDiv` in `lib/index.js`, `click.svg`, `cursor*.svg`, `qr-code.svg`, `routes/api/*`, `routes/places/*`, `.env`, the empty root `llms.txt`, and the `* { cursor: none !important }` rule. Dependencies are removed if unused after cleanup (each checked): `@graphcms/rich-text-html-renderer`, `bits-ui`, `svelte-sonner`, `runed`, `@sveltejs/adapter-vercel` (replaced by `adapter-static`).

## 7. Discoverability: SEO, LLMs, ATS

Sources and full reasoning are in the [research notes](../../research/2026-10-19-llm-seo-and-ats.md). The guiding finding: Google, OpenAI and Perplexity document **no special "AI optimization"**. Visibility comes from crawlable, indexed, text-first pages with structured data that matches the visible text. So no GEO tricks, no AI-only content.

### 7.1 Per page (`Seo` component)

Unique `<title>` and meta description, canonical and robots per the §4.2 indexing rule, Open Graph and Twitter tags. The share image is the story's first image, or her portrait.

### 7.2 Structured data (JSON-LD)

- **One `Person` entity** with a stable `@id` of `https://shivani-illakiya.com/#person`, defined in full on `/about` inside a `ProfilePage` (`mainEntity`). Properties: `name` (name only), `jobTitle`, `description`, `image`, `worksFor` (Indulge, The New Indian Express), `alumniOf` (Loyola College, Ethiraj College for Women), `address` (Chennai), `knowsAbout` (food, restaurants, travel, culture, Chennai), and `sameAs` (LinkedIn, Indulge author page, Instagram if used).
- `/` and `/resume` reference the Person by `@id` (`/resume` may repeat `worksFor`/`alumniOf`). No `OrganizationRole` or other resume markup, since Google documents none.
- **Story pages:** `Article` with `headline`, `image`, `datePublished`, `author` `{ "@id": "#person", name, url: "/about" }`, and `publisher` set to the original publication when `sourceUrl` exists.
- These help Google understand who she is. **No visible rich result is expected.**

### 7.3 Crawl files

- `static/robots.txt`: the existing allow-all rules plus `Sitemap: https://shivani-illakiya.com/sitemap.xml`. No per-bot groups, so every search and AI crawler is allowed.
- `/sitemap.xml`: a prerendered endpoint listing all indexable pages (excludes `noindex` stories) with `lastmod`.
- `/llms.txt`: a prerendered endpoint in llmstxt.org v2 format (H1 name, blockquote bio, H2 link lists for About, Resume (HTML + PDF), Selected stories with deks, Contact). Cheap, and it passes Lighthouse's agentic check, but Google says Search ignores it and no AI provider says it reads it. No `llms-full.txt`. The empty repo-root `llms.txt` is deleted.

### 7.4 Text, not images

All key facts (name, title, employer, beats, contact) are real HTML text. The handwritten `Signature` is decorative (`aria-hidden`) beneath a real `<h1>`.

### 7.5 Resume page and PDF (ATS)

ATS products parse only the uploaded file. None documents crawling portfolio links, so the site is for the human recruiter who clicks through, and the PDF is what the ATS reads.

- **`/resume`:** standard headings (Summary, Experience, Education, Skills), wording identical to the PDF, an `<article>` per role with `<time datetime>`, plain lists.
- **PDF:** text-based (selectable), single column, no text boxes, tables or images for content, name and contact in the body (not the page header), the site URL as plain text, named `Shivani-Illakiya-Resume.pdf`, document title metadata set. Her current resume already meets all of this except the site URL.

### 7.6 Hosting and tooling

- Cloudflare DNS records stay **DNS-only (grey cloud)** pointing at Vercel, as Vercel recommends. Cloudflare's AI-bot policies (Search/Agent/Training, whose new-domain defaults can block crawlers including Googlebot) only act on proxied traffic. If the proxy is ever turned on, set all three policies to Allow and leave Bot Preference Sync off.
- Vercel: leave the "AI bots" ruleset at Allow and Bot Protection off (the defaults).
- Verify the domain in **Google Search Console** and **Bing Webmaster Tools** (Bing feeds Copilot) and submit the sitemap to both.

### 7.7 Off-site (recommendation for Shivani, not code)

Keep the same facts and the site link on her LinkedIn profile, Naukri headline, and Indulge author bio. Consistent entity facts across sources plausibly help how search and LLMs describe her. This is industry judgement, not documented by any provider.

### 7.8 No-JS

All content renders without JavaScript.

## 8. Motion and accessibility

| Where | Motion | Reduced motion |
|-------|--------|----------------|
| Cards | Hover/focus lift 2–3px, tilt to 0°, ~150ms CSS | Shadow change only |
| Home hero | Signature draws once (~1.2s) | Shown drawn |
| Home hero | Polaroid and notes draggable (desktop, bounded, inertia) | Static |
| Story page | Header object stamps in (~300ms scale and settle) | Fade only |

GSAP is limited to Draggable, Inertia and DrawSVG, imported only on the pages that use them.

**Accessibility:** ordered headings; `header`/`nav`/`main`/`footer` landmarks; skip link; decoration is `aria-hidden` and never carries meaning; visible focus rings; tap targets of at least 44px; dragging is decoration only.

## 9. Failure handling

- Invalid story content fails the build with a message naming the file and field.
- Unknown slug → 404 page.
- Missing optional items (clipping, venue, `sourceUrl`) leave that block out; the layout still reads as complete.
- GSAP or other script failure doesn't affect content (it's all in the HTML).
- Prerender fails on broken internal links (SvelteKit default `handleHttpError: 'fail'`).

## 10. Migration, build order, testing

### 10.1 Before any deletion

1. This spec and the research notes are committed on a `redesign` branch (only the `docs/` files).
2. Commit the remaining working tree (experiments, plus the deleted `pnpm-lock.yaml`) to an `experiments` branch so nothing is lost.
3. Return to `redesign`, restore the lockfile, and bring over `src/lib/assets/name.svg` from `experiments`.

### 10.2 Hygraph exit

A one-off script reads the existing `.env`, exports the Hygraph posts to `src/content/stories/<slug>/index.md` with their images downloaded, and is then deleted along with the API routes and `.env`. Afterwards the Hygraph token can be revoked.

### 10.3 Launch content

- **Food:** "Under watchful eyes, a Chennai dining room serves up the South's many stories" (Rasanai). `sourceUrl` set, excerpt mode.
- **Travel:** one exported Hygraph story.
- **Culture:** a clearly marked placeholder until she supplies a real piece.

Real stories are added as she sends them (typically 2–3 photos each).

### 10.4 Build order (each step leaves a working site)

1. Foundation: cleanup, `adapter-static`, tokens, fonts, layout, header and footer
2. Content pipeline: loader, `profile.js`, `site.js`, 3 placeholder stories
3. Pages: story page → stories list → home → resume → about → 404
4. Discoverability: `Seo`, JSON-LD, sitemap, robots, `llms.txt`
5. Delight: signature, draggable hero, stamp-in, hover lifts
6. Launch: Vercel project, domain DNS, final checks

### 10.5 Testing

- **Vitest** unit tests for `stories.js`: each validation error, the excerpt split with and without the marker, `fullText` defaults, the indexing rule (canonical, robots, sitemap inclusion for all three cases), read time.
- **Build** as integration test: prerender crawl + loader validation.
- **Launch checklist:**
  - Lighthouse ≥ 95 (performance, accessibility, SEO)
  - Google Rich Results Test / Schema Markup Validator on `/`, `/about`, `/resume`, one story
  - 375px mobile pass; keyboard-only pass; JavaScript-disabled pass
  - `/llms.txt`, `/sitemap.xml`, `/robots.txt` and the PDF resolve on the live domain; the sitemap has no `noindex` URLs
  - Cloudflare records are grey-cloud; Vercel bot rulesets are at their defaults
  - Domain verified in Google Search Console and Bing Webmaster Tools; sitemap submitted
  - The site URL is added to the PDF resume, her LinkedIn and her Naukri profile

## 11. Later (not v1)

- Flip-card story header with highlights and reporter's notes.
- Clips archive (title, publication, date, link).
- Inline images inside article body text.
- RSS feed.
- Generating the PDF from `profile.js`.
