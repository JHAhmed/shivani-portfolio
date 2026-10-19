# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site as a fully prerendered SvelteKit portfolio for journalist Shivani Illakiya. Stories live in local Markdown, each content type is shown as its own paper object (receipt, ticket stub, boarding pass, sticky note, polaroid, luggage tag), and the site is readable by search engines, LLM tools and recruiters.

**Architecture:** SvelteKit 2 with `adapter-static`; every route is prerendered. Story Markdown and the resume data are read at build time on the server only. A pure parser (`src/lib/content/parse.js`) validates content and fails the build on bad data. Images go through `@sveltejs/enhanced-img`. SEO, JSON-LD, `sitemap.xml` and `llms.txt` are generated from the same data modules, so nothing drifts.

**Tech Stack:** Svelte 5 (runes), SvelteKit 2.42, Vite 7, Tailwind CSS 4 (+ typography plugin), gray-matter, marked, GSAP 3.13 (Draggable, InertiaPlugin, DrawSVGPlugin), Fontsource fonts, Vitest.

**Spec:** [`docs/superpowers/specs/2026-10-19-portfolio-redesign-design.md`](../specs/2026-10-19-portfolio-redesign-design.md). Research notes: [`docs/research/2026-10-19-llm-seo-and-ats.md`](../../research/2026-10-19-llm-seo-and-ats.md).

## Global Constraints

- **Package manager:** pnpm 10.15.0. If `pnpm` isn't on PATH, run every `pnpm …` command in this plan as `npx -y pnpm@10.15.0 …`.
- **Versions:** don't upgrade `svelte`, `@sveltejs/kit` or `vite`. Use `@sveltejs/adapter-static@^3.0.10` and `@sveltejs/enhanced-img@^0.11.0`. The latest majors (adapter-static 4, enhanced-img 1) require Kit 3 / Vite 8.
- **Svelte:** Svelte 5 runes only (`$props`, `$state`, `$derived`, snippets, `onclick=`). Use `$app/state`, never `$app/stores`. Load the `svelte-core-bestpractices` skill before writing `.svelte` files.
- **Lint rules this repo enforces** (eslint-plugin-svelte 3.12):
  - every `{#each}` must have a key;
  - `{@html}` is an error, so each intended use gets `<!-- eslint-disable-next-line svelte/no-at-html-tags -->`;
  - `svelte/no-unused-props` is on.
- **Formatting:** Prettier with tabs, single quotes, printWidth 100, Tailwind class sorting. Run `pnpm exec prettier --write <changed files>` before each commit.
- **Design tokens only:** colours and fonts come from `app.css` `@theme` (paper, ink, muted, line, receipt, ticket, boarding, note, tag). No Google Fonts. Body text contrast must be ≥ 4.5:1 on every paper colour.
- **Fonts:** Urbanist for all readable text; Caveat (`font-hand`) only for sticky notes and polaroid captions; IBM Plex Mono (`font-mono`) only for ticket and receipt fine print.
- **No hamburger menu, no custom cursor, no phone number anywhere on the site** (the phone number stays in the PDF only).
- **Static only:** everything prerenders. No secrets, no runtime server code, no API routes.
- **Content accuracy:** resume facts on the site must match `Shivani-Illakiya-Resume.pdf` word for word.
- **Commits:** end every commit message with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Motion:** every animation has a `prefers-reduced-motion` fallback. Dragging only happens on `(pointer: fine)` devices.

## File map

```
src/app.css                                  theme tokens, base styles, paper utilities
src/app.html                                 (unchanged)
src/routes/+layout.js                        prerender = true
src/routes/+layout.svelte                    fonts, header, main, footer
src/routes/+page.server.js / +page.svelte    home
src/routes/+error.svelte                     404 "lost luggage"
src/routes/stories/+page.server.js / +page.svelte          story list + filter
src/routes/stories/[slug]/+page.server.js / +page.svelte   story page
src/routes/about/+page.svelte
src/routes/resume/+page.svelte
src/routes/sitemap.xml/+server.js
src/routes/llms.txt/+server.js
src/content/stories/<slug>/index.md + images                content
src/lib/data/site.js                         site URL, name, links
src/lib/data/profile.js                      resume facts (single source)
src/lib/content/types.js                     STORY_TYPES, TYPE_META, TILTS (client-safe)
src/lib/content/parse.js                     parseStory, selectStories, toCard (pure, tested)
src/lib/content/images.js                    picture(key): enhanced image lookup (client-safe)
src/lib/server/stories.js                    getStories, getStory (glob wrapper, server-only)
src/lib/format.js                            date/route formatting (pure, tested)
src/lib/seo/jsonld.js                        JSON-LD builders (pure, tested)
src/lib/seo/sitemap.js                       sitemap builder (pure, tested)
src/lib/seo/llms.js                          llms.txt builder (pure, tested)
src/lib/actions/draggable.js                 GSAP drag action
src/lib/components/*.svelte                  SiteHeader, SiteFooter, LuggageTag, Seo, StoryCard,
                                             TypeFilter, Figure, Clipping, ReceiptHeader,
                                             TicketHeader, BoardingPassHeader, Polaroid,
                                             StickyNote, Signature
scripts/placeholder-image.mjs                generates labelled placeholder JPGs
static/robots.txt, static/og.jpg, static/Shivani-Illakiya-Resume.pdf
```

**Deviations from the spec, decided while planning:**
1. `Signature` uses the hand-drawn stroke paths from the experimental `Text.svelte`, not `name.svg`. `name.svg` is a font `<text>` element, which DrawSVG can't animate.
2. The `Seo` component is built (Task 6) before the pages, so pages don't need rework later.
3. For the Rasanai placeholder, only the two opening paragraphs go into the repo (enough for excerpt mode) until Shivani supplies her own copy of the full text.

---

### Task 1: Preserve the experiments and set up the `redesign` branch

**Files:**
- Branch `experiments`: every current working-tree change (no code edits)
- Branch `redesign`: restore `pnpm-lock.yaml`

**Interfaces:**
- Produces: a clean `redesign` branch (containing the spec, research and this plan) and an `experiments` branch holding `Text.svelte`, `name.svg` and `Shivani-Resume.pdf` for later tasks to copy from.

- [ ] **Step 1: Confirm the starting state**

Run: `git branch --show-current && git status --short`
Expected: branch `redesign`; changes listed, including ` D pnpm-lock.yaml`, `?? Shivani-Resume.pdf`, `?? src/lib/components/Text.svelte`, `?? llms.txt`.

- [ ] **Step 2: Commit the experiments to their own branch**

```bash
git checkout -b experiments
git add -A
git commit -m "chore: snapshot design experiments before redesign" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Check `git show --stat HEAD` to confirm `.env` is **not** in the commit (it's gitignored).

- [ ] **Step 3: Return to `redesign` and confirm it's clean**

```bash
git checkout redesign
git status --short
ls pnpm-lock.yaml
```

Expected: empty status; `pnpm-lock.yaml` exists; `.env` still exists locally (ignored, needed in Task 2).

- [ ] **Step 4: Install dependencies from the lockfile**

Run: `pnpm install --frozen-lockfile`
Expected: completes without errors.

---

### Task 2: Export the existing Hygraph stories

**Files:**
- Create (temporary, never committed): `scripts/export-hygraph.mjs`
- Create: `src/content/stories/<slug>/index.md` + downloaded images for each exported post

**Interfaces:**
- Produces: travel story folders in the frontmatter format of spec §4.2, used as launch content by Task 5.

- [ ] **Step 1: Write the export script**

Create `scripts/export-hygraph.mjs`:

```js
// One-off: export Hygraph posts to src/content/stories/<slug>/index.md. Delete after use.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const env = Object.fromEntries(
	readFileSync('.env', 'utf8')
		.split(/\r?\n/)
		.filter((line) => line.includes('=') && !line.trim().startsWith('#'))
		.map((line) => {
			const i = line.indexOf('=');
			return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
		})
);

const query = `query {
  posts(first: 100) {
    slug title description createdAt
    content { markdown references { __typename ... on Asset { url mimeType } } }
  }
}`;

const res = await fetch(env.HYGRAPH_PROJECT_ENVIRONMENT, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.HYGRAPH_PAT}` },
	body: JSON.stringify({ query })
});
const json = await res.json();
if (!res.ok || json.errors) {
	console.error(res.status, JSON.stringify(json.errors ?? json, null, 2));
	process.exit(1);
}

const IMAGE = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;

for (const post of json.data.posts) {
	const dir = join('src/content/stories', post.slug);
	if (existsSync(join(dir, 'index.md'))) {
		console.log(`skip ${post.slug} (already exported)`);
		continue;
	}
	mkdirSync(dir, { recursive: true });

	const markdown = post.content?.markdown ?? '';
	const urls = [
		...[...markdown.matchAll(IMAGE)].map((m) => m[1]),
		...(post.content?.references ?? [])
			.filter((r) => r.__typename === 'Asset' && r.mimeType?.startsWith('image/'))
			.map((r) => r.url)
	];
	const unique = [...new Set(urls)].slice(0, 3);

	const images = [];
	for (const [i, url] of unique.entries()) {
		const img = await fetch(url);
		const type = img.headers.get('content-type') ?? '';
		const ext = type.includes('png') ? '.png' : type.includes('webp') ? '.webp' : '.jpg';
		const name = `photo-${i + 1}${ext}`;
		writeFileSync(join(dir, name), Buffer.from(await img.arrayBuffer()));
		images.push(`  - { src: "./${name}", alt: "REPLACE: describe photo ${i + 1}" }`);
	}

	const body = markdown.replace(IMAGE, '').replace(/\n{3,}/g, '\n\n').trim();
	const frontmatter = [
		'---',
		`title: ${JSON.stringify(post.title)}`,
		`dek: ${JSON.stringify(post.description ?? '')}`,
		'type: travel',
		`date: ${post.createdAt.slice(0, 10)}`,
		'images:',
		...images,
		'---',
		''
	].join('\n');
	writeFileSync(join(dir, 'index.md'), `${frontmatter}${body}\n`);
	console.log(`exported ${post.slug} (${images.length} images)`);
}
```

- [ ] **Step 2: Run it**

Run: `node scripts/export-hygraph.mjs`
Expected: one `exported <slug> (N images)` line per post.

**If it fails** (expired token, deleted project, network): note the error, delete `scripts/export-hygraph.mjs`, and skip to Step 5. Task 5 Step 6 then creates a travel placeholder instead.

- [ ] **Step 3: Review each exported story by hand**

For each `src/content/stories/<slug>/index.md`:
- Open each `photo-N` file and replace every `REPLACE: describe photo N` alt with a real one-sentence description. Task 4's parser rejects alt text starting with `REPLACE`.
- If a post has 0 images, delete the `images:` line. Task 5 Step 6 adds a placeholder image.
- If `dek` is `""`, write a one-line standfirst from the first paragraph.
- Add `venue: "MAS → YCD"` (or the right route) and `featured: true` to the one travel story you want on the home page.
- Delete folders for posts that are drafts or test content.

- [ ] **Step 4: Commit the exported content only**

```bash
git add src/content/stories
git commit -m "content: import travel stories from Hygraph" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Delete the script and the secrets**

```bash
rm -f scripts/export-hygraph.mjs .env
git status --short
```

Expected: clean status. (Tell the user the Hygraph token can now be revoked in the Hygraph dashboard.)

---

### Task 3: Foundation: dependencies, config, theme, data, layout shell

**Files:**
- Delete: `src/lib/components/` (all), `src/lib/shared/`, `src/lib/state.svelte.js`, `src/lib/index.js`, `src/lib/utils.js`, `src/lib/assets/click.svg`, `src/lib/assets/cursor.svg`, `src/lib/assets/cursor2.svg`, `src/lib/assets/qr-code.svg`, `src/routes/api/`, `src/routes/places/`
- Modify: `package.json`, `svelte.config.js`, `vite.config.js`, `eslint.config.js`, `src/app.css`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`
- Create: `src/routes/+layout.js`, `src/lib/data/site.js`, `src/lib/data/profile.js`, `src/lib/components/SiteHeader.svelte`, `src/lib/components/SiteFooter.svelte`, `src/lib/components/LuggageTag.svelte`

**Interfaces:**
- Produces:
  - `site` from `$lib/data/site.js`: `{ url: string, name: string, title: string, description: string, indulgeAuthorUrl: string, resumePdf: string }`, plus `buildYear: number`
  - `profile` from `$lib/data/profile.js` (shape below; used by every page, JSON-LD and llms.txt)
  - Tailwind tokens: `bg-paper text-ink text-muted border-line bg-receipt bg-ticket text-ticket-ink bg-boarding text-boarding-ink bg-note text-note-ink bg-tag text-tag-ink font-hand font-mono`

- [ ] **Step 1: Remove the old experiments, API routes and Hygraph code**

```bash
git rm -r -q src/lib/components src/lib/shared src/lib/state.svelte.js src/lib/index.js src/lib/utils.js \
  src/lib/assets/click.svg src/lib/assets/cursor.svg src/lib/assets/cursor2.svg src/lib/assets/qr-code.svg \
  src/routes/api src/routes/places
```

- [ ] **Step 2: Swap dependencies**

```bash
pnpm remove @graphcms/rich-text-html-renderer bits-ui svelte-sonner runed @iconify/svelte clsx tailwind-merge @tailwindcss/forms @sveltejs/adapter-vercel
pnpm add gray-matter
pnpm add -D @sveltejs/adapter-static@^3.0.10 @sveltejs/enhanced-img@^0.11.0 @fontsource-variable/urbanist @fontsource-variable/caveat @fontsource/ibm-plex-mono vitest sharp
```

Then edit `package.json`: add `"test": "vitest run"` to `scripts`, and add `"sharp"` to `pnpm.onlyBuiltDependencies` (next to `"esbuild"`).

- [ ] **Step 3: Configure SvelteKit, Vite and ESLint**

Replace `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		prerender: {
			entries: ['*'],
			// TEMPORARY: the nav links to pages that later tasks create. Task 12 removes this line
			// so broken links fail the build again.
			handleHttpError: 'warn'
		}
	}
};

export default config;
```

Replace `vite.config.js`:

```js
import tailwindcss from '@tailwindcss/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), enhancedImages(), sveltekit()],
	test: {
		include: ['src/**/*.test.js'],
		environment: 'node'
	}
});
```

In `eslint.config.js`, append this object as the last array element:

```js
	{
		rules: {
			// The site is served from the domain root with no `paths.base`, so plain hrefs are correct.
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
```

- [ ] **Step 4: Replace `src/app.css`**

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

@theme {
	--font-sans: 'Urbanist Variable', ui-sans-serif, system-ui, sans-serif;
	--font-hand: 'Caveat Variable', cursive;
	--font-mono: 'IBM Plex Mono', ui-monospace, monospace;

	--color-paper: #f7f4ef;
	--color-ink: #1f1d1a;
	--color-muted: #5b554c;
	--color-line: #e5e0d6;
	--color-receipt: #fffefb;
	--color-ticket: #f6c9b9;
	--color-ticket-ink: #5c2412;
	--color-boarding: #bfe3d6;
	--color-boarding-ink: #0f3d33;
	--color-note: #fde68a;
	--color-note-ink: #4a3a05;
	--color-tag: #e9d9b8;
	--color-tag-ink: #3b2f17;
}

@layer base {
	html {
		background-color: var(--color-paper);
		color: var(--color-ink);
	}

	body {
		-webkit-font-smoothing: antialiased;
	}

	:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 3px;
	}

	::selection {
		background-color: var(--color-note);
	}
}
```

- [ ] **Step 5: Create the data modules**

`src/lib/data/site.js`:

```js
export const site = {
	url: 'https://shivani-illakiya.com',
	name: 'Shivani Illakiya',
	title: 'Shivani Illakiya · Food, travel and culture journalist',
	description:
		'Shivani Illakiya is a Chennai-based journalist and food correspondent at Indulge, The New Indian Express, writing about food, travel and culture.',
	indulgeAuthorUrl: 'https://www.indulgexpress.com/author/shivani-illakiya-p-t',
	resumePdf: '/Shivani-Illakiya-Resume.pdf'
};

export const buildYear = new Date().getFullYear();
```

`src/lib/data/profile.js` (summary and bullets are verbatim from the resume PDF; `bio`, `beats` and `highlights` are site copy for Shivani to review):

```js
// Keep in sync with static/Shivani-Illakiya-Resume.pdf: both must say the same thing.
export const profile = {
	name: 'Shivani Illakiya',
	headline: 'Journalist and Food Correspondent',
	location: 'Chennai, Tamil Nadu',
	address: { locality: 'Chennai', region: 'Tamil Nadu', country: 'IN' },
	email: 'shivani.p.t.illakiya@gmail.com',
	links: {
		/** @type {string | null} */
		linkedin: null,
		/** @type {string | null} */
		instagram: null
	},
	worksFor: { name: 'Indulge, The New Indian Express', url: 'https://www.indulgexpress.com' },
	knowsAbout: [
		'Food journalism',
		'Restaurants',
		'Travel writing',
		'Culture',
		'Chennai',
		'Feature writing',
		'Copy editing'
	],
	beats: ['Food', 'Travel', 'Hospitality', 'Culture', 'City life'],
	highlights: ['40+ new restaurants found for coverage', 'Keeps a two-page food section running'],
	summary:
		'Journalist and Food Correspondent at Indulge, The New Indian Express, with a background in reporting, editing and developing original stories for print and digital. A quick learner who takes initiative, adapts to new responsibilities, and takes ownership of stories from ideation to publication. Passionate about travel and exploring destinations through their food, people, design, heritage and local experiences. Skilled in coordinating with editorial teams, contributors, and industry professionals, with working knowledge of Adobe InDesign and Quintype CMS.',
	bio: [
		"I'm a journalist and the food correspondent at Indulge, The New Indian Express, in Chennai. I track down the city's new restaurants, pop-ups and food trends, and keep our two-page food section full.",
		'I like getting to know a place through its food, its people, its design and its heritage, whether that place is a new dining room down the road or a town I have travelled to.',
		"Before Indulge I was a sub-editor at Daily Thanthi's DT Next, and I started out as an intern at The Hindu's MetroPlus, where I wrote a front-page lead for the Madras Day edition. I studied English at Ethiraj College for Women and Loyola College."
	],
	experience: [
		{
			org: 'Indulge, The New Indian Express',
			role: 'Reporter & Sub-editor | Food Correspondent',
			location: 'Chennai, Tamil Nadu',
			start: '2024-10',
			end: null,
			earlier: false,
			bullets: [
				{
					label: 'Food Correspondence',
					text: "Lead food coverage for Indulge, identifying new restaurants, food pop-ups, emerging culinary trends, and noteworthy developments across Chennai's food scene. Collaborate with colleagues on story ideas and restaurant leads, helping sustain a consistent two-page food section since taking charge of the beat."
				},
				{
					label: 'Features and City Coverage',
					text: 'Develop and report original features across food, travel, hospitality, culture and city life, exploring local communities, heritage and changing lifestyles. Identified over 40 new dining establishments for coverage, contributing to my transition into the Food Correspondent role.'
				},
				{
					label: 'Column and Commercial Coordination',
					text: 'Liaise with a columnist to coordinate copy and column requirements, while working with the marketing team on advertisement placements and advertorial production.'
				},
				{
					label: 'Digital Features and Publishing',
					text: 'Pitch, research, and write online-first stories in collaboration with the digital team, developing original content that receives positive reader engagement.'
				},
				{
					label: 'Event Coordination',
					text: 'Supported guest coordination for the Devi Awards, assisting with on-ground requirements and contributing to the smooth execution of the event.'
				},
				{
					label: 'Kolkata Editorial Production',
					text: "Managed copy editing, fact-checking, pagination, advertorials and booklets, coordinating with designers, editorial, and marketing teams. Streamlined workflows to move page completion from midnight to 8 pm and independently managed much of the anniversary edition's production."
				}
			]
		},
		{
			org: 'Daily Thanthi',
			role: 'Sub-Editor',
			location: 'Chennai, Tamil Nadu',
			start: '2023-10',
			end: '2024-10',
			earlier: false,
			bullets: [
				{
					text: "Curated and edited news content for DT Next's national and international pages, exercising editorial judgement in story selection, prioritisation and page composition while ensuring accuracy and adherence to publication deadlines."
				},
				{
					text: "Assisted the editor with mast-page production, gaining exposure to the newspaper's front-page editorial workflow."
				},
				{
					text: "Contributed features coverage of notable cultural events across the city, producing stories that generated strong readership and ranked among the most-viewed articles on the publication's internal platform"
				}
			]
		},
		{
			org: 'The Hindu',
			role: 'Intern',
			location: 'Chennai, Tamil Nadu',
			start: '2022-06',
			end: '2022-07',
			earlier: true,
			bullets: [
				{
					text: "Researched and reported stories on Chennai's events and personalities for The Hindu's MetroPlus, publishing four articles, including a front-page lead story in its special Madras Day edition."
				}
			]
		},
		{
			org: 'Ethiraj College for Women',
			role: 'Student Editor & Designer, Scrambler Magazine',
			location: 'Chennai, Tamil Nadu',
			start: '2019-07',
			end: '2020-04',
			earlier: true,
			bullets: [
				{ text: 'Led a team of 12 student editors and designers to produce the annual literary magazine.' },
				{
					text: 'Reviewed 350+ submissions, shortlisted 100 pieces for publication, and designed editorial layouts.'
				}
			]
		}
	],
	education: [
		{
			institution: 'Loyola College',
			degree: 'Master of Arts (English)',
			location: 'Chennai, Tamil Nadu',
			end: '2023-04'
		},
		{
			institution: 'Ethiraj College for Women',
			degree: 'Bachelor of Arts (English)',
			location: 'Chennai, Tamil Nadu',
			end: '2021-04'
		}
	],
	skills: {
		tools: ['Adobe InDesign', 'Canva', 'Quintype CMS', 'Google Workspace'],
		specialisms: [
			'Research',
			'Editorial Coordination',
			'Food and Travel Photography',
			'Feature Writing',
			'Story Ideation'
		]
	}
};
```

- [ ] **Step 6: Create the layout shell**

`src/routes/+layout.js`:

```js
export const prerender = true;
export const trailingSlash = 'never';
```

`src/lib/components/SiteHeader.svelte`:

```svelte
<script>
	import { page } from '$app/state';
	import { site } from '$lib/data/site.js';

	const links = [
		{ href: '/stories', label: 'Stories' },
		{ href: '/about', label: 'About' },
		{ href: '/resume', label: 'Resume' },
		{ href: '#contact', label: 'Contact' }
	];

	/** @param {string} href */
	function isCurrent(href) {
		const path = page.url.pathname;
		return href.startsWith('/') && (path === href || path.startsWith(`${href}/`));
	}
</script>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
	>Skip to content</a>

<header
	class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 px-4 pt-5 sm:px-6">
	<a href="/" class="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight"
		>{site.name}</a>
	<nav aria-label="Main">
		<ul class="flex gap-5 text-[0.95rem] text-muted sm:gap-7">
			{#each links as link (link.href)}
				<li>
					<a
						href={link.href}
						aria-current={isCurrent(link.href) ? 'page' : undefined}
						class="inline-flex min-h-11 items-center hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
						>{link.label}</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
```

`src/lib/components/LuggageTag.svelte` (the shadow lives on the outer element because `clip-path` would cut it off):

```svelte
<script>
	import { profile } from '$lib/data/profile.js';
</script>

<div class="drop-shadow-sm" style="rotate: -1deg">
	<div
		class="relative bg-tag py-4 pr-6 pl-12 text-tag-ink [clip-path:polygon(22px_0,100%_0,100%_100%,22px_100%,0_50%)]">
		<span
			aria-hidden="true"
			class="absolute top-1/2 left-5 size-3 -translate-y-1/2 rounded-full border-2 border-tag-ink/50 bg-paper"
		></span>
		<p class="font-mono text-xs tracking-wider uppercase">If found, please contact</p>
		<a
			href="mailto:{profile.email}"
			class="mt-1 block text-base font-semibold break-all hover:underline sm:text-lg"
			>{profile.email}</a>
	</div>
</div>
```

`src/lib/components/SiteFooter.svelte`:

```svelte
<script>
	import LuggageTag from '$lib/components/LuggageTag.svelte';
	import { profile } from '$lib/data/profile.js';
	import { buildYear, site } from '$lib/data/site.js';

	const links = [
		{ href: profile.links.linkedin, label: 'LinkedIn', rel: 'me' },
		{ href: profile.links.instagram, label: 'Instagram', rel: 'me' },
		{ href: site.indulgeAuthorUrl, label: 'My work on Indulge', rel: undefined }
	].filter((link) => link.href);
</script>

<footer id="contact" class="mt-24 border-t border-line">
	<div
		class="mx-auto flex max-w-6xl flex-col items-start gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight">Get in touch</h2>
			<p class="mt-2 max-w-md text-muted">
				For assignments, collaborations or a conversation about food, write to me.
			</p>
			<ul class="mt-4 flex flex-wrap gap-x-6 gap-y-1">
				{#each links as link (link.label)}
					<li>
						<a href={link.href} rel={link.rel} class="inline-flex min-h-11 items-center underline underline-offset-4"
							>{link.label}</a>
					</li>
				{/each}
				<li>
					<a href={site.resumePdf} download class="inline-flex min-h-11 items-center underline underline-offset-4"
						>Resume (PDF)</a>
				</li>
			</ul>
		</div>
		<LuggageTag />
	</div>
	<p class="mx-auto max-w-6xl px-4 pb-8 text-sm text-muted sm:px-6">© {buildYear} {site.name}</p>
</footer>
```

Replace `src/routes/+layout.svelte`:

```svelte
<script>
	import '@fontsource-variable/urbanist';
	import '@fontsource-variable/caveat';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SiteHeader />
<main id="main" tabindex="-1" class="mx-auto max-w-6xl px-4 outline-none sm:px-6">
	{@render children()}
</main>
<SiteFooter />
```

Replace `src/routes/+page.svelte` with a temporary home (Task 9 replaces it):

```svelte
<script>
	import { profile } from '$lib/data/profile.js';
</script>

<svelte:head>
	<title>{profile.name}</title>
</svelte:head>

<h1 class="pt-16 text-5xl font-semibold tracking-tight">{profile.name}</h1>
<p class="mt-4 text-xl text-muted">{profile.headline}</p>
```

- [ ] **Step 7: Verify nothing references removed code, and the build works**

```bash
grep -rnE "\\\$components|\\\$lib/(index|utils|state)|graphcms|bits-ui|iconify|svelte-sonner|HYGRAPH" src || echo "clean"
pnpm build
pnpm exec eslint src
```

Expected: `clean`; the build ends with `Wrote site to "build"` (with 404 warnings for `/stories`, `/about` and `/resume`, which don't exist yet); eslint reports no errors.

Then run `pnpm preview` and open http://localhost:4173. Expected: paper background, Urbanist text, a header with Stories/About/Resume/Contact on one row at 1280px and wrapping to a second row at 375px, a footer with the luggage tag, and no custom cursor.

- [ ] **Step 8: Commit**

```bash
pnpm exec prettier --write src svelte.config.js vite.config.js eslint.config.js package.json
git add -A
git commit -m "feat: static foundation with paper theme, header and footer" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Content parsing (TDD)

**Files:**
- Create: `src/lib/content/types.js`, `src/lib/format.js`, `src/lib/content/parse.js`
- Test: `src/lib/format.test.js`, `src/lib/content/parse.test.js`

**Interfaces:**
- Produces:
  - `types.js`: `STORY_TYPES = ['food','culture','travel']`; `TYPE_META[type] = { label: string }`; `TILTS: number[]`
  - `format.js`: `formatMonthYear('2024-10' | '2024-10-03') → 'Oct 2024'`; `formatDate('2026-10-03') → '3 Oct 2026'`; `formatRange(start, end|null) → 'Oct 2024 – Present'`; `splitRoute('MAS → YCD') → ['MAS','YCD'] | null`
  - `parse.js`:
    - `parseStory({ slug, raw, assetKeys }) → Story`
    - `selectStories(stories, { type?, featured? }) → Story[]` (newest first)
    - `toCard(story) → StoryCardData`
    - `readTime(md) → number`
    - `excerptMarkdown(md) → string`
    - `toIsoDate(value) → string | null`
  - `Story = { slug, title, dek, type, date, venue, publication, sourceUrl, fullText, context, featured, images: { key, alt, caption, credit }[], clipping: string|null, readTime, html, indexable }`
  - `StoryCardData = { slug, title, dek, type, date, venue, readTime, cover: string }` (`cover` is an image key)
  - Image keys look like `/src/content/stories/<slug>/<file>`

- [ ] **Step 1: Write the failing format tests**

`src/lib/format.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { formatDate, formatMonthYear, formatRange, splitRoute } from './format.js';

describe('format', () => {
	it('formats year-month and full dates', () => {
		expect(formatMonthYear('2024-10')).toBe('Oct 2024');
		expect(formatMonthYear('2025-09-14')).toBe('Sep 2025');
		expect(formatDate('2026-10-03')).toBe('3 Oct 2026');
	});

	it('formats ranges, with Present for open-ended roles', () => {
		expect(formatRange('2023-10', '2024-10')).toBe('Oct 2023 – Oct 2024');
		expect(formatRange('2024-10', null)).toBe('Oct 2024 – Present');
	});

	it('splits travel routes written with an arrow', () => {
		expect(splitRoute('MAS → YCD')).toEqual(['MAS', 'YCD']);
		expect(splitRoute('MAS -> LEH')).toEqual(['MAS', 'LEH']);
		expect(splitRoute('Rasanai, Chennai')).toBeNull();
		expect(splitRoute(null)).toBeNull();
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `./format.js`.

- [ ] **Step 3: Implement `format.js` and `types.js`**

`src/lib/format.js`:

```js
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** @param {string} value `YYYY-MM` or `YYYY-MM-DD` */
export function formatMonthYear(value) {
	const [year, month] = value.split('-');
	return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** @param {string} value `YYYY-MM-DD` */
export function formatDate(value) {
	const [year, month, day] = value.split('-');
	return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

/**
 * @param {string} start
 * @param {string | null} end
 */
export function formatRange(start, end) {
	return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : 'Present'}`;
}

/**
 * @param {string | null | undefined} venue
 * @returns {[string, string] | null}
 */
export function splitRoute(venue) {
	if (!venue) return null;
	const parts = venue.split(/\s*(?:→|->)\s*/);
	return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null;
}
```

`src/lib/content/types.js`:

```js
export const STORY_TYPES = ['food', 'culture', 'travel'];

/** @type {Record<string, { label: string }>} */
export const TYPE_META = {
	food: { label: 'Food' },
	culture: { label: 'Culture' },
	travel: { label: 'Travel' }
};

/** Resting tilt (degrees) for cards, cycled by position so grids look hand-placed. */
export const TILTS = [-1.2, 0.8, -0.6, 1.1];
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing parser tests**

`src/lib/content/parse.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { excerptMarkdown, parseStory, readTime, selectStories, toCard } from './parse.js';

const DIR = '/src/content/stories/demo';
const assetKeys = new Set([`${DIR}/photo.jpg`, `${DIR}/photo-2.jpg`, `${DIR}/clip.jpg`]);
const BODY = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
const BASE = {
	title: 'Demo story',
	dek: 'A demo dek',
	type: 'food',
	date: '2026-10-03',
	images: [{ src: './photo.jpg', alt: 'A plate of food' }]
};

/** JSON is valid YAML, so fixtures can be plain objects. */
function raw(data, body = BODY) {
	return `---\n${JSON.stringify(data)}\n---\n${body}`;
}

function parse(data, body) {
	return parseStory({ slug: 'demo', raw: raw(data, body), assetKeys });
}

describe('parseStory', () => {
	it('parses a valid original story with defaults', () => {
		const story = parse(BASE);
		expect(story).toMatchObject({
			slug: 'demo',
			title: 'Demo story',
			type: 'food',
			date: '2026-10-03',
			sourceUrl: null,
			fullText: true,
			featured: false,
			indexable: true,
			clipping: null,
			images: [{ key: `${DIR}/photo.jpg`, alt: 'A plate of food', caption: null, credit: null }]
		});
		expect(story.html).toContain('Third paragraph.');
	});

	it('accepts unquoted YAML dates', () => {
		const yaml = `---\ntitle: T\ndek: D\ntype: travel\ndate: 2026-01-22\nimages:\n  - { src: ./photo.jpg, alt: Hills }\n---\nBody`;
		expect(parseStory({ slug: 'demo', raw: yaml, assetKeys }).date).toBe('2026-01-22');
	});

	it.each(['title', 'dek', 'type', 'date', 'images'])('rejects a missing %s', (field) => {
		const data = { ...BASE };
		delete data[field];
		expect(() => parse(data)).toThrow(`demo/index.md: missing required field "${field}"`);
	});

	it('rejects an unknown type', () => {
		expect(() => parse({ ...BASE, type: 'sports' })).toThrow('type must be one of food, culture, travel');
	});

	it('rejects an invalid date', () => {
		expect(() => parse({ ...BASE, date: 'October 3' })).toThrow('date must be a YYYY-MM-DD date');
	});

	it('rejects zero or more than three images', () => {
		expect(() => parse({ ...BASE, images: [] })).toThrow('images must list 1 to 3 photos');
		const four = Array(4).fill({ src: './photo.jpg', alt: 'x' });
		expect(() => parse({ ...BASE, images: four })).toThrow('images must list 1 to 3 photos');
	});

	it('rejects image paths that do not exist or are not relative', () => {
		expect(() => parse({ ...BASE, images: [{ src: './missing.jpg', alt: 'x' }] })).toThrow(
			'images[0].src "./missing.jpg" not found'
		);
		expect(() => parse({ ...BASE, images: [{ src: 'photo.jpg', alt: 'x' }] })).toThrow(
			'images[0].src must be a relative path'
		);
	});

	it('requires real alt text', () => {
		expect(() => parse({ ...BASE, images: [{ src: './photo.jpg' }] })).toThrow('images[0].alt is required');
		expect(() =>
			parse({ ...BASE, images: [{ src: './photo.jpg', alt: 'REPLACE: describe photo 1' }] })
		).toThrow('images[0].alt still has placeholder text');
	});

	it('resolves an optional clipping and rejects a missing one', () => {
		expect(parse({ ...BASE, clipping: './clip.jpg' }).clipping).toBe(`${DIR}/clip.jpg`);
		expect(() => parse({ ...BASE, clipping: './nope.jpg' })).toThrow('clipping "./nope.jpg" not found');
	});

	it('rejects a sourceUrl that is not http(s)', () => {
		expect(() => parse({ ...BASE, sourceUrl: 'indulgexpress.com/x' })).toThrow(
			'sourceUrl must be an http(s) URL'
		);
	});

	it('shows an indexable excerpt when sourceUrl is set without fullText', () => {
		const story = parse({ ...BASE, sourceUrl: 'https://example.com/a' });
		expect(story.fullText).toBe(false);
		expect(story.indexable).toBe(true);
		expect(story.html).toContain('Second paragraph.');
		expect(story.html).not.toContain('Third paragraph.');
	});

	it('marks republished full text as not indexable', () => {
		const story = parse({ ...BASE, sourceUrl: 'https://example.com/a', fullText: true });
		expect(story.fullText).toBe(true);
		expect(story.indexable).toBe(false);
		expect(story.html).toContain('Third paragraph.');
	});

	it('forces full text for stories without a sourceUrl', () => {
		expect(parse({ ...BASE, fullText: false }).fullText).toBe(true);
	});
});

describe('excerptMarkdown', () => {
	it('cuts at the more marker when present', () => {
		expect(excerptMarkdown('One.\n\nTwo.\n\nThree.\n\n<!-- more -->\n\nFour.')).toBe(
			'One.\n\nTwo.\n\nThree.'
		);
	});

	it('falls back to the first two paragraphs', () => {
		expect(excerptMarkdown(BODY)).toBe('First paragraph.\n\nSecond paragraph.');
	});
});

describe('readTime', () => {
	it('rounds up at 200 words per minute, minimum one', () => {
		expect(readTime('word '.repeat(450))).toBe(3);
		expect(readTime('short')).toBe(1);
	});
});

describe('selectStories and toCard', () => {
	const a = parse({ ...BASE, title: 'Old', date: '2025-01-01' });
	const b = { ...parse({ ...BASE, title: 'New', type: 'travel', featured: true }), slug: 'new' };

	it('sorts newest first and filters', () => {
		expect(selectStories([a, b]).map((s) => s.title)).toEqual(['New', 'Old']);
		expect(selectStories([a, b], { type: 'food' }).map((s) => s.title)).toEqual(['Old']);
		expect(selectStories([a, b], { featured: true }).map((s) => s.title)).toEqual(['New']);
	});

	it('reduces a story to card data', () => {
		expect(toCard(a)).toEqual({
			slug: 'demo',
			title: 'Old',
			dek: 'A demo dek',
			type: 'food',
			date: '2025-01-01',
			venue: null,
			readTime: 1,
			cover: `${DIR}/photo.jpg`
		});
	});
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `./parse.js`.

- [ ] **Step 7: Implement `parse.js`**

`src/lib/content/parse.js`:

```js
import matter from 'gray-matter';
import { marked } from 'marked';
import { STORY_TYPES } from './types.js';

const MORE = '<!-- more -->';
const WORDS_PER_MINUTE = 200;
const REQUIRED = ['title', 'dek', 'type', 'date', 'images'];
const PLACEHOLDER_ALT = /^(replace|todo)\b/i;

/** @typedef {{ key: string, alt: string, caption: string | null, credit: string | null }} StoryImage */
/**
 * @typedef {{
 *   slug: string, title: string, dek: string, type: string, date: string,
 *   venue: string | null, publication: string | null, sourceUrl: string | null,
 *   fullText: boolean, context: string | null, featured: boolean,
 *   images: StoryImage[], clipping: string | null, readTime: number,
 *   html: string, indexable: boolean
 * }} Story
 */
/**
 * @typedef {{ slug: string, title: string, dek: string, type: string, date: string,
 *   venue: string | null, readTime: number, cover: string }} StoryCardData
 */

/** @param {unknown} value */
export function toIsoDate(value) {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) ? null : value;
	}
	return null;
}

/** @param {string} markdown */
export function readTime(markdown) {
	const words = markdown.replace(MORE, ' ').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** @param {string} markdown */
export function excerptMarkdown(markdown) {
	const cut = markdown.indexOf(MORE);
	if (cut !== -1) return markdown.slice(0, cut).trim();
	return markdown
		.trim()
		.split(/\n\s*\n/)
		.filter((block) => block.trim())
		.slice(0, 2)
		.join('\n\n');
}

/**
 * @param {string} file
 * @param {string} slug
 * @param {unknown} src
 * @param {string} label
 * @param {Set<string>} assetKeys
 */
function resolveAsset(file, slug, src, label, assetKeys) {
	if (typeof src !== 'string' || !src.startsWith('./')) {
		throw new Error(`${file}: ${label} must be a relative path like "./photo.jpg"`);
	}
	const key = `/src/content/stories/${slug}/${src.slice(2)}`;
	if (!assetKeys.has(key)) throw new Error(`${file}: ${label} "${src}" not found next to index.md`);
	return key;
}

/**
 * Parse and validate one story. Throws with the file and field named, so a bad story fails the build.
 * @param {{ slug: string, raw: string, assetKeys: Set<string> }} input
 * @returns {Story}
 */
export function parseStory({ slug, raw, assetKeys }) {
	const file = `${slug}/index.md`;
	const { data, content } = matter(raw);

	for (const field of REQUIRED) {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			throw new Error(`${file}: missing required field "${field}"`);
		}
	}
	if (!STORY_TYPES.includes(data.type)) {
		throw new Error(`${file}: type must be one of ${STORY_TYPES.join(', ')} (got "${data.type}")`);
	}
	const date = toIsoDate(data.date);
	if (!date) throw new Error(`${file}: date must be a YYYY-MM-DD date`);
	if (!Array.isArray(data.images) || data.images.length < 1 || data.images.length > 3) {
		throw new Error(`${file}: images must list 1 to 3 photos`);
	}

	const images = data.images.map((image, i) => {
		const label = `images[${i}]`;
		const key = resolveAsset(file, slug, image?.src, `${label}.src`, assetKeys);
		const alt = typeof image.alt === 'string' ? image.alt.trim() : '';
		if (!alt) throw new Error(`${file}: ${label}.alt is required`);
		if (PLACEHOLDER_ALT.test(alt)) throw new Error(`${file}: ${label}.alt still has placeholder text`);
		return { key, alt, caption: image.caption ?? null, credit: image.credit ?? null };
	});

	const sourceUrl = data.sourceUrl ?? null;
	if (sourceUrl !== null && !/^https?:\/\/\S+$/.test(sourceUrl)) {
		throw new Error(`${file}: sourceUrl must be an http(s) URL`);
	}
	const fullText = sourceUrl ? data.fullText === true : true;

	return {
		slug,
		title: String(data.title),
		dek: String(data.dek),
		type: data.type,
		date,
		venue: data.venue ?? null,
		publication: data.publication ?? null,
		sourceUrl,
		fullText,
		context: data.context ?? null,
		featured: data.featured === true,
		images,
		clipping: data.clipping ? resolveAsset(file, slug, data.clipping, 'clipping', assetKeys) : null,
		readTime: readTime(content),
		html: /** @type {string} */ (
			marked.parse(fullText ? content : excerptMarkdown(content), { async: false })
		),
		indexable: !(sourceUrl && fullText)
	};
}

/**
 * @param {Story[]} stories
 * @param {{ type?: string, featured?: boolean }} [filter]
 */
export function selectStories(stories, { type, featured } = {}) {
	return stories
		.filter((s) => (!type || s.type === type) && (!featured || s.featured))
		.toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/**
 * @param {Story} story
 * @returns {StoryCardData}
 */
export function toCard(story) {
	return {
		slug: story.slug,
		title: story.title,
		dek: story.dek,
		type: story.type,
		date: story.date,
		venue: story.venue,
		readTime: story.readTime,
		cover: story.images[0].key
	};
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm test`
Expected: PASS (all format and parse tests).

- [ ] **Step 9: Commit**

```bash
pnpm exec prettier --write src/lib
git add src/lib/format.js src/lib/format.test.js src/lib/content
git commit -m "feat: validated story parser and formatting helpers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Content loading and launch stories

**Files:**
- Create: `src/lib/server/stories.js`, `src/lib/content/images.js`, `scripts/placeholder-image.mjs`
- Create: `src/content/stories/under-watchful-eyes/index.md` + `photo-1.jpg`, `photo-2.jpg`
- Create: `src/content/stories/culture-placeholder/index.md` + `photo-1.jpg`
- Create (only if Task 2 produced no travel story): `src/content/stories/motorcycles-mountains-and-mist/index.md` + `photo-1.jpg`
- Create: `src/lib/assets/portrait.jpg`, `static/og.jpg`, `static/Shivani-Illakiya-Resume.pdf`
- Test: `src/lib/server/stories.test.js`

**Interfaces:**
- Consumes: `parseStory`, `selectStories` (Task 4)
- Produces:
  - `getStories(filter?) → Story[]` and `getStory(slug) → Story` (throws SvelteKit 404) from `$lib/server/stories.js`
  - `picture(key) → Picture` (an enhanced-img object `{ sources, img: { src, w, h } }`) from `$lib/content/images.js`
  - Asset `$lib/assets/portrait.jpg` and static files `/og.jpg` and `/Shivani-Illakiya-Resume.pdf`

- [ ] **Step 1: Write the failing repository-content test**

`src/lib/server/stories.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { getStories, getStory } from './stories.js';

describe('repository stories', () => {
	it('has at least one story of each type', () => {
		const types = new Set(getStories().map((s) => s.type));
		expect([...types].sort()).toEqual(['culture', 'food', 'travel']);
	});

	it('has at least one featured story', () => {
		expect(getStories({ featured: true }).length).toBeGreaterThan(0);
	});

	it('throws a 404 for an unknown slug', () => {
		/** @type {any} */
		let thrown;
		try {
			getStory('does-not-exist');
		} catch (e) {
			thrown = e;
		}
		expect(thrown?.status).toBe(404);
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `./stories.js`.

- [ ] **Step 3: Implement the loaders**

`src/lib/server/stories.js`:

```js
import { error } from '@sveltejs/kit';
import { parseStory, selectStories } from '$lib/content/parse.js';

const files = import.meta.glob('/src/content/stories/*/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
});
const assetKeys = new Set(Object.keys(import.meta.glob('/src/content/stories/*/*.{jpg,jpeg,png,webp}')));

/** Parsed once at build time; any invalid story throws here and fails the build. */
const stories = Object.entries(files).map(([path, raw]) =>
	parseStory({ slug: path.split('/').at(-2) ?? '', raw: /** @type {string} */ (raw), assetKeys })
);

/** @param {{ type?: string, featured?: boolean }} [filter] */
export function getStories(filter) {
	return selectStories(stories, filter);
}

/** @param {string} slug */
export function getStory(slug) {
	const story = stories.find((s) => s.slug === slug);
	if (!story) error(404, 'Story not found');
	return story;
}
```

`src/lib/content/images.js`:

```js
const pictures = import.meta.glob('/src/content/stories/*/*.{jpg,jpeg,png,webp}', {
	eager: true,
	import: 'default',
	query: { enhanced: true }
});

/**
 * Look up the enhanced image for a story image key (e.g. "/src/content/stories/x/photo-1.jpg").
 * @param {string} key
 */
export function picture(key) {
	const pic = pictures[key];
	if (!pic) throw new Error(`Unknown story image: ${key}`);
	return /** @type {import('vite-imagetools').Picture} */ (pic);
}
```

- [ ] **Step 4: Create the placeholder image script**

`scripts/placeholder-image.mjs`:

```js
// Usage: node scripts/placeholder-image.mjs <out.jpg> <#hex> "<label>" [width] [height]
import sharp from 'sharp';

const [out, color, label, width = '1600', height = '1067'] = process.argv.slice(2);
if (!out || !color || !label) {
	console.error('Usage: node scripts/placeholder-image.mjs <out.jpg> <#hex> "<label>" [width] [height]');
	process.exit(1);
}

const w = Number(width);
const h = Number(height);
const text = label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<rect width="100%" height="100%" fill="${color}"/>
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif"
 font-size="${Math.round(h / 16)}" fill="#1f1d1a" fill-opacity="0.6">${text}</text></svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(out);
console.log(`wrote ${out}`);
```

- [ ] **Step 5: Create the food story (Rasanai, excerpt mode)**

```bash
mkdir -p src/content/stories/under-watchful-eyes src/content/stories/culture-placeholder
node scripts/placeholder-image.mjs src/content/stories/under-watchful-eyes/photo-1.jpg "#e8d5b5" "Photo coming soon"
node scripts/placeholder-image.mjs src/content/stories/under-watchful-eyes/photo-2.jpg "#d9c7a5" "Photo coming soon"
```

Create `src/content/stories/under-watchful-eyes/index.md`. For the body, open the `sourceUrl` and paste the article's **first two paragraphs** verbatim, one blank line apart, followed by a `<!-- more -->` line. The first starts "The moment you enter Rasanai, you are greeted not by soft lighting or music…" and the second "The sea is close, the air carries salt…". Don't paste the rest; the full text comes from Shivani later.

```markdown
---
title: "Under watchful eyes, a Chennai dining room serves up the South's many stories"
dek: 'Food at this new restaurant is lingered over and protected, much like the moments shared around the table'
type: food
date: 2026-10-03
venue: 'Rasanai, Chennai'
publication: 'Indulge, The New Indian Express'
sourceUrl: 'https://www.indulgexpress.com/food/food-chennai/2026/Oct/03/under-watchful-eyes-a-chennai-dining-room-serves-up-the-souths-many-stories'
fullText: false
featured: true
images:
  - { src: ./photo-1.jpg, alt: 'Placeholder image for the Rasanai story' }
  - { src: ./photo-2.jpg, alt: 'Second placeholder image for the Rasanai story' }
---

(paragraph 1 from the article)

(paragraph 2 from the article)

<!-- more -->
```

- [ ] **Step 6: Create the culture placeholder, and the travel placeholder if needed**

```bash
node scripts/placeholder-image.mjs src/content/stories/culture-placeholder/photo-1.jpg "#f6c9b9" "Culture story coming soon"
```

`src/content/stories/culture-placeholder/index.md`:

```markdown
---
title: 'A culture story is on its way'
dek: 'This space is reserved for a culture feature Shivani reported first-hand.'
type: culture
date: 2026-10-11
venue: 'Chennai'
featured: true
images:
  - { src: ./photo-1.jpg, alt: 'Placeholder image for an upcoming culture story' }
---

This is a placeholder for a culture feature. It will be replaced with a story Shivani reported in person.
```

**Only if `ls src/content/stories` shows no travel story from Task 2**, run:

```bash
mkdir -p src/content/stories/motorcycles-mountains-and-mist
node scripts/placeholder-image.mjs src/content/stories/motorcycles-mountains-and-mist/photo-1.jpg "#bfe3d6" "Travel photo coming soon"
```

and create `src/content/stories/motorcycles-mountains-and-mist/index.md`:

```markdown
---
title: 'Motorcycles, mountains and mist'
dek: 'A ride up to Yercaud, told through the food stops along the way.'
type: travel
date: 2026-01-22
venue: 'MAS → YCD'
featured: true
images:
  - { src: ./photo-1.jpg, alt: 'Placeholder image for the Yercaud travel story' }
---

This is a placeholder for Shivani's Yercaud travel story. The full piece will replace this text.
```

If a Task 2 story has no images, add a placeholder the same way (`photo-1.jpg`, `#bfe3d6`) and an `images:` entry pointing at it.

- [ ] **Step 7: Create the portrait, OG image and resume PDF**

```bash
node scripts/placeholder-image.mjs src/lib/assets/portrait.jpg "#d8cdb8" "Portrait coming soon" 900 900
node scripts/placeholder-image.mjs static/og.jpg "#f7f4ef" "Shivani Illakiya · food, travel and culture" 1200 630
git show experiments:Shivani-Resume.pdf > static/Shivani-Illakiya-Resume.pdf
```

Check: `head -c 5 static/Shivani-Illakiya-Resume.pdf` prints `%PDF-`.

- [ ] **Step 8: Run the tests**

Run: `pnpm test`
Expected: PASS, including `repository stories`. If a Task 2 story fails validation, the error names the file and field; fix the content, not the parser.

- [ ] **Step 9: Commit**

```bash
pnpm exec prettier --write src/lib scripts
git add -A
git commit -m "feat: story loader, image lookup and launch content" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: SEO component and JSON-LD (TDD)

**Files:**
- Create: `src/lib/seo/jsonld.js`, `src/lib/components/Seo.svelte`
- Test: `src/lib/seo/jsonld.test.js`

**Interfaces:**
- Consumes: `site`, `profile` (Task 3); the `Story` shape (Task 4)
- Produces:
  - `absoluteUrl(siteUrl, path) → string`
  - `personId(siteUrl) → string`
  - `personJsonLd(site, profile, imageUrl?)`
  - `profilePageJsonLd(site, profile, imageUrl?)`
  - `personRefJsonLd(site, profile)`
  - `articleJsonLd(site, profile, story, imageUrl)`
  - `serializeJsonLd(data) → string`
  - `<Seo title? description path image? robots? type? jsonLd? />`; `image` is a root-relative path, `/og.jpg` by default

- [ ] **Step 1: Write the failing tests**

`src/lib/seo/jsonld.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { profile } from '$lib/data/profile.js';
import { site } from '$lib/data/site.js';
import {
	absoluteUrl,
	articleJsonLd,
	personRefJsonLd,
	profilePageJsonLd,
	serializeJsonLd
} from './jsonld.js';

const story = {
	slug: 'demo',
	title: 'Demo',
	dek: 'A demo',
	date: '2026-10-03',
	sourceUrl: 'https://www.indulgexpress.com/x',
	publication: 'Indulge, The New Indian Express'
};

describe('jsonld', () => {
	it('builds absolute URLs', () => {
		expect(absoluteUrl(site.url, '/about')).toBe('https://shivani-illakiya.com/about');
		expect(absoluteUrl(site.url, '/')).toBe('https://shivani-illakiya.com/');
	});

	it('wraps a full Person with a stable @id in a ProfilePage', () => {
		const page = profilePageJsonLd(site, profile, 'https://shivani-illakiya.com/p.jpg');
		expect(page['@type']).toBe('ProfilePage');
		expect(page.mainEntity).toMatchObject({
			'@type': 'Person',
			'@id': 'https://shivani-illakiya.com/#person',
			name: 'Shivani Illakiya',
			jobTitle: 'Journalist and Food Correspondent',
			image: 'https://shivani-illakiya.com/p.jpg',
			worksFor: { name: 'Indulge, The New Indian Express' },
			sameAs: [site.indulgeAuthorUrl]
		});
		expect(page.mainEntity.alumniOf.map((a) => a.name)).toEqual([
			'Loyola College',
			'Ethiraj College for Women'
		]);
	});

	it('references the same person elsewhere', () => {
		expect(personRefJsonLd(site, profile)['@id']).toBe('https://shivani-illakiya.com/#person');
	});

	it('builds an Article pointing at the author page and the original', () => {
		const article = articleJsonLd(site, profile, story, 'https://shivani-illakiya.com/i.jpg');
		expect(article).toMatchObject({
			'@type': 'Article',
			headline: 'Demo',
			datePublished: '2026-10-03',
			url: 'https://shivani-illakiya.com/stories/demo',
			author: { '@id': 'https://shivani-illakiya.com/#person', url: 'https://shivani-illakiya.com/about' },
			isBasedOn: 'https://www.indulgexpress.com/x',
			publisher: { name: 'Indulge, The New Indian Express' }
		});
	});

	it('omits publisher fields for original stories', () => {
		const article = articleJsonLd(site, profile, { ...story, sourceUrl: null }, 'x');
		expect(article.publisher).toBeUndefined();
		expect(article.isBasedOn).toBeUndefined();
	});

	it('escapes < so JSON-LD cannot close the script tag', () => {
		expect(serializeJsonLd({ a: '</script>' })).toBe('{"a":"\\u003c/script>"}');
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `./jsonld.js`.

- [ ] **Step 3: Implement `jsonld.js`**

`src/lib/seo/jsonld.js`:

```js
/**
 * @param {string} siteUrl
 * @param {string} path
 */
export function absoluteUrl(siteUrl, path) {
	return new URL(path, siteUrl).href;
}

/** @param {string} siteUrl */
export function personId(siteUrl) {
	return `${siteUrl}/#person`;
}

/**
 * Full Person entity. Defined once (inside the /about ProfilePage) and referenced by @id elsewhere.
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 * @param {string} [imageUrl]
 */
export function personJsonLd(site, profile, imageUrl) {
	return {
		'@type': 'Person',
		'@id': personId(site.url),
		name: profile.name,
		url: absoluteUrl(site.url, '/about'),
		jobTitle: profile.headline,
		description: profile.summary,
		...(imageUrl && { image: imageUrl }),
		email: `mailto:${profile.email}`,
		address: {
			'@type': 'PostalAddress',
			addressLocality: profile.address.locality,
			addressRegion: profile.address.region,
			addressCountry: profile.address.country
		},
		worksFor: {
			'@type': 'NewsMediaOrganization',
			name: profile.worksFor.name,
			url: profile.worksFor.url
		},
		alumniOf: profile.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
		knowsAbout: profile.knowsAbout,
		sameAs: [profile.links.linkedin, profile.links.instagram, site.indulgeAuthorUrl].filter(Boolean)
	};
}

/**
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 * @param {string} [imageUrl]
 */
export function profilePageJsonLd(site, profile, imageUrl) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: absoluteUrl(site.url, '/about'),
		name: `About ${profile.name}`,
		mainEntity: personJsonLd(site, profile, imageUrl)
	};
}

/**
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 */
export function personRefJsonLd(site, profile) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': personId(site.url),
		name: profile.name,
		url: absoluteUrl(site.url, '/about')
	};
}

/**
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 * @param {{ slug: string, title: string, dek: string, date: string, sourceUrl: string | null, publication: string | null }} story
 * @param {string} imageUrl
 */
export function articleJsonLd(site, profile, story, imageUrl) {
	const url = absoluteUrl(site.url, `/stories/${story.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: story.title,
		description: story.dek,
		datePublished: story.date,
		image: [imageUrl],
		url,
		mainEntityOfPage: url,
		author: {
			'@type': 'Person',
			'@id': personId(site.url),
			name: profile.name,
			url: absoluteUrl(site.url, '/about')
		},
		...(story.sourceUrl && { isBasedOn: story.sourceUrl }),
		...(story.sourceUrl &&
			story.publication && { publisher: { '@type': 'Organization', name: story.publication } })
	};
}

/** @param {unknown} data */
export function serializeJsonLd(data) {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Create the `Seo` component**

`src/lib/components/Seo.svelte`:

```svelte
<script>
	import { site } from '$lib/data/site.js';
	import { absoluteUrl, serializeJsonLd } from '$lib/seo/jsonld.js';

	/**
	 * @type {{
	 *   title?: string,
	 *   description: string,
	 *   path: string,
	 *   image?: string,
	 *   robots?: string,
	 *   type?: 'website' | 'article' | 'profile',
	 *   jsonLd?: object[]
	 * }}
	 */
	let {
		title,
		description,
		path,
		image = '/og.jpg',
		robots = 'index, follow',
		type = 'website',
		jsonLd = []
	} = $props();

	let fullTitle = $derived(title ? `${title} · ${site.name}` : site.title);
	let url = $derived(absoluteUrl(site.url, path));
	let imageUrl = $derived(absoluteUrl(site.url, image));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={imageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	{#each jsonLd as data, i (i)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<script type="application/ld+json">${serializeJsonLd(data)}</` + 'script>'}
	{/each}
</svelte:head>
```

- [ ] **Step 6: Use it on the temporary home and check the output**

In `src/routes/+page.svelte`, replace the `<svelte:head>` block with:

```svelte
<Seo description={site.description} path="/" jsonLd={[personRefJsonLd(site, profile)]} />
```

and add these imports to its `<script>`:

```js
import Seo from '$lib/components/Seo.svelte';
import { site } from '$lib/data/site.js';
import { personRefJsonLd } from '$lib/seo/jsonld.js';
```

Run: `pnpm build && grep -o '<link rel="canonical"[^>]*>' build/index.html && grep -c 'application/ld+json' build/index.html`
Expected: `<link rel="canonical" href="https://shivani-illakiya.com/">` and `1`.

- [ ] **Step 7: Commit**

```bash
pnpm exec prettier --write src
git add src
git commit -m "feat: Seo component and JSON-LD builders" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Paper utilities, story cards and the `/stories` page

**Files:**
- Modify: `src/app.css` (append utilities)
- Create: `src/lib/components/StoryCard.svelte`, `src/lib/components/TypeFilter.svelte`, `src/routes/stories/+page.server.js`, `src/routes/stories/+page.svelte`

**Interfaces:**
- Consumes: `getStories` (Task 5); `toCard` and `StoryCardData` (Task 4); `picture` (Task 5); `TYPE_META`, `STORY_TYPES`, `TILTS`; `formatMonthYear`, `splitRoute`; `Seo`
- Produces:
  - CSS utilities `paper` (tilt via `--tilt`, lift on hover/focus), `edge-zigzag` and `stamp-in`
  - `<StoryCard story={StoryCardData} tilt={number} level={2|3} />`
  - `<TypeFilter bind:value />` (value is `'all' | 'food' | 'culture' | 'travel'`)

- [ ] **Step 1: Append the paper utilities to `src/app.css`**

```css
/* A paper object resting at a slight tilt; it straightens and lifts on hover or focus.
   drop-shadow (not box-shadow) so masked and clipped shapes cast the right shadow. */
@utility paper {
	rotate: var(--tilt, 0deg);
	filter: drop-shadow(0 1px 1px rgb(31 29 26 / 0.12));
	transition:
		rotate 150ms ease-out,
		translate 150ms ease-out,
		filter 150ms ease-out;

	@media (max-width: 40rem) {
		rotate: calc(var(--tilt, 0deg) / 2);
	}

	&:hover,
	&:focus-within {
		filter: drop-shadow(0 10px 14px rgb(31 29 26 / 0.22));
	}

	@media (prefers-reduced-motion: no-preference) {
		&:hover,
		&:focus-within {
			rotate: 0deg;
			translate: 0 -3px;
		}
	}
}

/* Receipt tear: zigzag bottom edge. */
@utility edge-zigzag {
	--zig: 14px;
	mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / var(--zig)
		100%;
}

@keyframes stamp-in {
	from {
		opacity: 0;
		scale: 1.05;
	}
	to {
		opacity: 1;
		scale: 1;
	}
}

@keyframes fade-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

/* Story-page header entrance; a plain fade under reduced motion. */
@utility stamp-in {
	animation: fade-in 300ms ease-out both;

	@media (prefers-reduced-motion: no-preference) {
		animation: stamp-in 320ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
	}
}
```

- [ ] **Step 2: Create `StoryCard`**

`src/lib/components/StoryCard.svelte`. All three types share one layout and footprint; only the signature detail changes (spec §5.2).

```svelte
<script>
	import { picture } from '$lib/content/images.js';
	import { TYPE_META } from '$lib/content/types.js';
	import { formatMonthYear, splitRoute } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').StoryCardData, tilt?: number, level?: 2 | 3 }} */
	let { story, tilt = 0, level = 2 } = $props();

	let label = $derived(TYPE_META[story.type].label);
	let when = $derived(formatMonthYear(story.date));
	let route = $derived(story.type === 'travel' ? splitRoute(story.venue) : null);

	const containers = {
		food: 'edge-zigzag bg-receipt pb-3',
		culture: 'rounded-md bg-ticket text-ticket-ink',
		travel: 'rounded-xl bg-receipt'
	};
</script>

<a
	href="/stories/{story.slug}"
	aria-label="{story.title}, {label} story, {when}"
	class="paper block h-full"
	style:--tilt="{tilt}deg">
	<div class="flex h-full overflow-hidden {containers[story.type]}">
		<div class="flex min-w-0 flex-1 flex-col">
			<enhanced:img
				src={picture(story.cover)}
				alt=""
				sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
				class="aspect-[3/2] w-full object-cover" />
			<div class="flex flex-1 flex-col gap-2 p-5">
				{#if route}
					<p aria-hidden="true" class="flex items-center gap-2 font-mono text-xs text-muted">
						{route[0]}
						<span class="flex-1 border-t border-dashed border-muted/50"></span>✈<span
							class="flex-1 border-t border-dashed border-muted/50"></span>
						{route[1]}
					</p>
				{/if}
				<p class="font-mono text-xs tracking-wider uppercase">{label} · {when}</p>
				<svelte:element this={`h${level}`} class="text-xl leading-tight font-semibold">
					{story.title}
				</svelte:element>
				<p class="line-clamp-3 {story.type === 'culture' ? '' : 'text-muted'}">{story.dek}</p>
				{#if story.type === 'food'}
					<dl aria-hidden="true" class="mt-auto space-y-0.5 pt-3 font-mono text-xs text-muted">
						{#if story.venue}
							<div class="flex gap-2">
								<dt>Venue</dt>
								<dd class="flex-1 truncate text-right">{story.venue}</dd>
							</div>
						{/if}
						<div class="flex gap-2">
							<dt>Read time</dt>
							<dd class="flex-1 text-right">{story.readTime} min</dd>
						</div>
					</dl>
				{/if}
			</div>
		</div>
		{#if story.type === 'culture'}
			<div
				aria-hidden="true"
				class="flex w-10 shrink-0 items-center justify-center border-l-2 border-dashed border-ticket-ink/30">
				<span class="rotate-90 font-mono text-xs tracking-widest whitespace-nowrap">ADMIT ONE</span>
			</div>
		{:else if story.type === 'travel'}
			<div aria-hidden="true" class="w-8 shrink-0 border-l-2 border-dashed border-line bg-boarding"></div>
		{/if}
	</div>
</a>
```

- [ ] **Step 3: Create `TypeFilter`**

`src/lib/components/TypeFilter.svelte`:

```svelte
<script>
	import { STORY_TYPES, TYPE_META } from '$lib/content/types.js';

	let { value = $bindable('all') } = $props();

	const options = [
		{ id: 'all', label: 'All' },
		...STORY_TYPES.map((type) => ({ id: type, label: TYPE_META[type].label }))
	];
</script>

<div role="group" aria-label="Filter stories by type" class="flex flex-wrap gap-2">
	{#each options as option (option.id)}
		<button
			type="button"
			aria-pressed={value === option.id}
			onclick={() => (value = option.id)}
			class="min-h-11 rounded-full border border-ink/25 px-5 hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper">
			{option.label}
		</button>
	{/each}
</div>
```

- [ ] **Step 4: Create the `/stories` route**

`src/routes/stories/+page.server.js`:

```js
import { toCard } from '$lib/content/parse.js';
import { getStories } from '$lib/server/stories.js';

export function load() {
	return { stories: getStories().map(toCard) };
}
```

`src/routes/stories/+page.svelte`. Every card is in the prerendered HTML; the filter only narrows them in the browser.

```svelte
<script>
	import Seo from '$lib/components/Seo.svelte';
	import StoryCard from '$lib/components/StoryCard.svelte';
	import TypeFilter from '$lib/components/TypeFilter.svelte';
	import { TILTS } from '$lib/content/types.js';
	import { site } from '$lib/data/site.js';

	let { data } = $props();

	let active = $state('all');
	let visible = $derived(
		active === 'all' ? data.stories : data.stories.filter((s) => s.type === active)
	);
</script>

<Seo
	title="Stories"
	description="Food, travel and culture stories reported and written by Shivani Illakiya."
	path="/stories" />

<section class="pt-12">
	<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Stories</h1>
	<p class="mt-3 max-w-2xl text-lg text-muted">
		Food, travel and culture stories I've reported and written, mostly from Chennai.
	</p>

	<div class="mt-8"><TypeFilter bind:value={active} /></div>

	<ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each visible as story, i (story.slug)}
			<li><StoryCard {story} tilt={TILTS[i % TILTS.length]} /></li>
		{/each}
	</ul>

	<p class="mt-14">
		<a href={site.indulgeAuthorUrl} class="font-semibold underline underline-offset-4"
			>See all my published work on Indulge →</a>
	</p>
</section>
```

- [ ] **Step 5: Verify in the browser**

Run: `pnpm build && pnpm preview`, then open http://localhost:4173/stories.

Expected:
- Three cards of equal size.
- Food has a zigzag bottom edge and venue/read-time lines.
- Culture is coral with an "ADMIT ONE" stub.
- Travel has a route line and a mint stub.
- Hovering a card straightens and lifts it.
- Filter chips narrow the grid, and "All" restores it.
- At 375px: one column, no horizontal scroll.

Then run `grep -c 'href="/stories/' build/stories.html`. Expected: ≥ 3, so all cards are present without JS.

(Story links 404 until Task 8. The build reports them as warnings, which is expected here.)

- [ ] **Step 6: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src
git commit -m "feat: paper story cards and filterable stories page" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Story page

**Files:**
- Create: `src/lib/components/Figure.svelte`, `src/lib/components/Clipping.svelte`, `src/lib/components/ReceiptHeader.svelte`, `src/lib/components/TicketHeader.svelte`, `src/lib/components/BoardingPassHeader.svelte`, `src/routes/stories/[slug]/+page.server.js`, `src/routes/stories/[slug]/+page.svelte`

**Interfaces:**
- Consumes: `getStories`, `getStory`, `picture`, `formatDate`, `splitRoute`, `Seo`, `articleJsonLd`, `site`, `profile`
- Produces:
  - `<Figure image={StoryImage} eager? />`
  - `<Clipping key={string} title={string} />`
  - `<ReceiptHeader story />`, `<TicketHeader story />`, `<BoardingPassHeader story />` (each renders the page's `<h1>`)

- [ ] **Step 1: Create `Figure` and `Clipping`**

`src/lib/components/Figure.svelte`:

```svelte
<script>
	import { picture } from '$lib/content/images.js';

	/** @type {{ image: { key: string, alt: string, caption: string | null, credit: string | null }, eager?: boolean }} */
	let { image, eager = false } = $props();
</script>

<figure class="my-10">
	<enhanced:img
		src={picture(image.key)}
		alt={image.alt}
		sizes="(min-width: 768px) 768px, 100vw"
		loading={eager ? 'eager' : 'lazy'}
		fetchpriority={eager ? 'high' : 'auto'}
		class="w-full rounded-sm" />
	{#if image.caption || image.credit}
		<figcaption class="mt-2 text-sm text-muted">
			{image.caption ?? ''}{#if image.caption && image.credit}
				·
			{/if}{#if image.credit}Photo: {image.credit}{/if}
		</figcaption>
	{/if}
</figure>
```

`src/lib/components/Clipping.svelte`:

```svelte
<script>
	import { picture } from '$lib/content/images.js';

	/** @type {{ key: string, title: string }} */
	let { key, title } = $props();

	let pic = $derived(picture(key));
</script>

<figure class="my-14">
	<a href={pic.img.src} class="paper relative mx-auto block max-w-md bg-receipt p-3" style:--tilt="1.5deg">
		<span aria-hidden="true" class="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-note/80"
		></span>
		<enhanced:img
			src={pic}
			alt="Print clipping of “{title}”"
			sizes="(min-width: 768px) 448px, 100vw"
			class="w-full" />
	</a>
	<figcaption class="mt-3 text-center text-sm text-muted">
		As it appeared in print. Select the clipping to view it full size.
	</figcaption>
</figure>
```

- [ ] **Step 2: Create the three headers**

`src/lib/components/ReceiptHeader.svelte`:

```svelte
<script>
	import { formatDate } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').Story }} */
	let { story } = $props();
</script>

<header class="paper stamp-in mx-auto max-w-xl" style:--tilt="-0.6deg">
	<div class="edge-zigzag bg-receipt px-6 pt-8 pb-12 font-mono text-sm sm:px-10">
		<p class="text-center tracking-[0.2em] uppercase">{story.publication ?? 'Shivani Illakiya'}</p>
		{#if story.venue}<p class="mt-1 text-center text-muted">{story.venue}</p>{/if}
		<p aria-hidden="true" class="my-5 overflow-hidden text-center whitespace-nowrap text-muted">
			- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		</p>
		<h1 class="font-sans text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
			{story.title}
		</h1>
		<dl class="mt-6 space-y-1">
			<div class="flex justify-between gap-4">
				<dt>Date</dt>
				<dd><time datetime={story.date}>{formatDate(story.date)}</time></dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt>Served by</dt>
				<dd>Shivani Illakiya</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt>Read time</dt>
				<dd>{story.readTime} min</dd>
			</div>
		</dl>
		<p class="mt-6 border-t border-dashed border-muted/40 pt-3 text-center tracking-[0.2em] uppercase">
			Thank you, visit again
		</p>
	</div>
</header>
```

`src/lib/components/TicketHeader.svelte`:

```svelte
<script>
	import { formatDate } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').Story }} */
	let { story } = $props();

	let serial = $derived(story.date.replaceAll('-', '').slice(2));
</script>

<header class="paper stamp-in mx-auto max-w-2xl" style:--tilt="0.6deg">
	<div class="flex overflow-hidden rounded-lg bg-ticket text-ticket-ink">
		<div class="flex-1 px-6 py-8 sm:px-10">
			<p class="font-mono text-xs tracking-[0.2em] uppercase">Admit one · Culture</p>
			<h1 class="mt-3 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
				{story.title}
			</h1>
			<dl class="mt-6 grid grid-cols-2 gap-4 font-mono text-sm sm:grid-cols-3">
				{#if story.venue}
					<div>
						<dt class="text-xs uppercase">Venue</dt>
						<dd>{story.venue}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-xs uppercase">Date</dt>
					<dd><time datetime={story.date}>{formatDate(story.date)}</time></dd>
				</div>
				<div>
					<dt class="text-xs uppercase">Read time</dt>
					<dd>{story.readTime} min</dd>
				</div>
			</dl>
		</div>
		<div
			aria-hidden="true"
			class="flex w-14 shrink-0 items-center justify-center border-l-2 border-dashed border-ticket-ink/30">
			<span class="rotate-90 font-mono text-xs tracking-widest whitespace-nowrap">No. {serial}</span>
		</div>
	</div>
</header>
```

`src/lib/components/BoardingPassHeader.svelte`:

```svelte
<script>
	import { formatDate, splitRoute } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').Story }} */
	let { story } = $props();

	let route = $derived(splitRoute(story.venue));
</script>

<header class="paper stamp-in mx-auto max-w-2xl" style:--tilt="-0.5deg">
	<div class="flex overflow-hidden rounded-2xl bg-receipt">
		<div class="flex-1 px-6 py-8 sm:px-10">
			<p class="font-mono text-xs tracking-[0.2em] text-muted uppercase">Boarding pass · Travel</p>
			{#if route}
				<p class="sr-only">Route: {route[0]} to {route[1]}</p>
				<div aria-hidden="true" class="mt-4 flex items-center gap-3 font-mono text-2xl font-medium">
					<span>{route[0]}</span>
					<span class="flex-1 border-t-2 border-dashed border-line"></span>
					<span class="text-muted">✈</span>
					<span class="flex-1 border-t-2 border-dashed border-line"></span>
					<span>{route[1]}</span>
				</div>
			{/if}
			<h1 class="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
				{story.title}
			</h1>
			<dl class="mt-6 grid grid-cols-2 gap-4 font-mono text-sm sm:grid-cols-3">
				<div>
					<dt class="text-xs text-muted uppercase">Passenger</dt>
					<dd>Shivani Illakiya</dd>
				</div>
				<div>
					<dt class="text-xs text-muted uppercase">Date</dt>
					<dd><time datetime={story.date}>{formatDate(story.date)}</time></dd>
				</div>
				{#if story.venue && !route}
					<div>
						<dt class="text-xs text-muted uppercase">Destination</dt>
						<dd>{story.venue}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-xs text-muted uppercase">Read time</dt>
					<dd>{story.readTime} min</dd>
				</div>
			</dl>
		</div>
		<div aria-hidden="true" class="w-12 shrink-0 border-l-2 border-dashed border-paper bg-boarding"></div>
	</div>
</header>
```

- [ ] **Step 3: Create the story route**

`src/routes/stories/[slug]/+page.server.js`:

```js
import { getStories, getStory } from '$lib/server/stories.js';

export function entries() {
	return getStories().map((story) => ({ slug: story.slug }));
}

/** @param {{ params: { slug: string } }} event */
export function load({ params }) {
	return { story: getStory(params.slug) };
}
```

`src/routes/stories/[slug]/+page.svelte`:

```svelte
<script>
	import BoardingPassHeader from '$lib/components/BoardingPassHeader.svelte';
	import Clipping from '$lib/components/Clipping.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import ReceiptHeader from '$lib/components/ReceiptHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import TicketHeader from '$lib/components/TicketHeader.svelte';
	import { picture } from '$lib/content/images.js';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { absoluteUrl, articleJsonLd } from '$lib/seo/jsonld.js';

	let { data } = $props();

	const headers = { food: ReceiptHeader, culture: TicketHeader, travel: BoardingPassHeader };

	let story = $derived(data.story);
	let Header = $derived(headers[story.type]);
	let cover = $derived(picture(story.images[0].key).img.src);
	let source = $derived(story.publication ?? 'the original publication');
</script>

<Seo
	title={story.title}
	description={story.dek}
	path="/stories/{story.slug}"
	image={cover}
	type="article"
	robots={story.indexable ? 'index, follow' : 'noindex, follow'}
	jsonLd={[articleJsonLd(site, profile, story, absoluteUrl(site.url, cover))]} />

<article class="mx-auto max-w-3xl pt-12">
	<Header {story} />

	<p class="mt-12 text-xl leading-relaxed text-pretty sm:text-2xl">{story.dek}</p>
	{#if story.context}
		<p class="mt-6 border-l-4 border-note pl-4 text-muted italic">{story.context}</p>
	{/if}

	<Figure image={story.images[0]} eager />

	<div class="prose prose-lg max-w-none prose-p:text-ink prose-a:text-ink prose-headings:text-ink">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html story.html}
	</div>

	{#if story.sourceUrl && !story.fullText}
		<p class="mt-10 border border-line bg-receipt p-5">
			This is an excerpt.
			<a href={story.sourceUrl} class="font-semibold underline underline-offset-4"
				>Read the full story on {source} →</a>
		</p>
	{:else if story.sourceUrl}
		<p class="mt-10 text-muted">
			Originally published in <a href={story.sourceUrl} class="underline underline-offset-4">{source}</a>.
		</p>
	{/if}

	{#each story.images.slice(1) as image (image.key)}
		<Figure {image} />
	{/each}

	{#if story.clipping}
		<Clipping key={story.clipping} title={story.title} />
	{/if}

	<p class="mt-14"><a href="/stories" class="font-semibold underline underline-offset-4">← All stories</a></p>
</article>
```

- [ ] **Step 4: Verify**

Run: `pnpm build && pnpm preview`, then open each story from http://localhost:4173/stories.

Expected:
- **Rasanai:** receipt header; excerpt of two paragraphs; "This is an excerpt. Read the full story on Indulge, The New Indian Express →" links to Indulge; two photos.
- **Culture placeholder:** coral ticket header with a "No. 261011" stub.
- **Travel:** boarding pass with a `MAS ✈ YCD` route line.
- Each header animates in once. With reduced motion turned on (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`) it only fades.
- At 375px: headers fit with no horizontal scroll.

Check robots: `grep -o '<meta name="robots"[^>]*>' build/stories/under-watchful-eyes.html`. Expected: `content="index, follow"`.

- [ ] **Step 5: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src
git commit -m "feat: story pages with receipt, ticket and boarding-pass headers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Home page

**Files:**
- Create: `src/lib/components/Polaroid.svelte`, `src/lib/components/StickyNote.svelte`, `src/routes/+page.server.js`
- Modify: `src/routes/+page.svelte` (full replacement)

**Interfaces:**
- Consumes: `getStories`, `toCard`, `StoryCard`, `TILTS`, `Seo`, `personRefJsonLd`, `profile`, `site`, `formatRange`, asset `$lib/assets/portrait.jpg`
- Produces:
  - `<Polaroid src={Picture} alt caption? tilt? class? />`
  - `<StickyNote tilt? color?: 'yellow' | 'blue' class?>…</StickyNote>`
  - A `data-drag-bounds` hero container (Task 13 makes its children draggable)

- [ ] **Step 1: Create `Polaroid` and `StickyNote`**

`src/lib/components/Polaroid.svelte`:

```svelte
<script>
	/** @type {{ src: import('vite-imagetools').Picture, alt: string, caption?: string, tilt?: number, class?: string }} */
	let { src, alt, caption, tilt = 0, class: className = '' } = $props();
</script>

<figure class="paper bg-receipt p-2.5 pb-3 {className}" style:--tilt="{tilt}deg">
	<enhanced:img {src} {alt} sizes="256px" class="aspect-square w-full object-cover" />
	{#if caption}
		<figcaption class="mt-2 text-center font-hand text-2xl leading-none">{caption}</figcaption>
	{/if}
</figure>
```

`src/lib/components/StickyNote.svelte`:

```svelte
<script>
	/** @type {{ tilt?: number, color?: 'yellow' | 'blue', class?: string, children: import('svelte').Snippet }} */
	let { tilt = 0, color = 'yellow', class: className = '', children } = $props();

	const colors = { yellow: 'bg-note text-note-ink', blue: 'bg-sky-200 text-sky-950' };
</script>

<div class="paper p-4 {colors[color]} {className}" style:--tilt="{tilt}deg">
	<p class="font-hand text-2xl leading-tight">{@render children()}</p>
</div>
```

- [ ] **Step 2: Create the home load function**

`src/routes/+page.server.js`:

```js
import { toCard } from '$lib/content/parse.js';
import { getStories } from '$lib/server/stories.js';

export function load() {
	const featured = getStories({ featured: true });
	const stories = (featured.length ? featured : getStories()).slice(0, 6).map(toCard);
	return { stories };
}
```

- [ ] **Step 3: Replace `src/routes/+page.svelte`**

```svelte
<script>
	import portrait from '$lib/assets/portrait.jpg?enhanced';
	import Polaroid from '$lib/components/Polaroid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import StickyNote from '$lib/components/StickyNote.svelte';
	import StoryCard from '$lib/components/StoryCard.svelte';
	import { TILTS } from '$lib/content/types.js';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { formatRange } from '$lib/format.js';
	import { personRefJsonLd } from '$lib/seo/jsonld.js';

	let { data } = $props();

	const recentRoles = profile.experience.slice(0, 3);
</script>

<Seo description={site.description} path="/" jsonLd={[personRefJsonLd(site, profile)]} />

<section class="grid items-center gap-12 pt-10 pb-16 md:grid-cols-[1.3fr_1fr] md:pt-20">
	<div>
		<h1 class="text-5xl font-semibold tracking-tight sm:text-6xl">{profile.name}</h1>
		<p class="mt-5 max-w-xl text-2xl leading-snug text-balance sm:text-3xl">
			Food, travel and culture stories from Chennai.
		</p>
		<p class="mt-4 max-w-xl text-lg text-muted">
			{profile.headline} at <em>Indulge</em>, The New Indian Express.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href="/stories"
				class="inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-ink/85"
				>Read my stories</a>
			<a
				href="/resume"
				class="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-6 font-semibold hover:border-ink"
				>View resume</a>
		</div>
	</div>

	<div data-drag-bounds class="relative mx-auto h-80 w-full max-w-sm">
		<Polaroid
			src={portrait}
			alt="Portrait of Shivani Illakiya"
			caption="that's me!"
			tilt={-5}
			class="absolute top-0 left-2 w-52" />
		<StickyNote tilt={4} class="absolute top-44 right-0 w-40">{profile.highlights[0]}</StickyNote>
		<StickyNote tilt={-3} color="blue" class="absolute top-4 right-1 w-36"
			>{profile.highlights[1]}</StickyNote>
	</div>
</section>

<section class="py-12" aria-labelledby="featured-title">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<h2 id="featured-title" class="text-3xl font-semibold tracking-tight">Featured stories</h2>
		<a href="/stories" class="font-semibold underline underline-offset-4">All stories →</a>
	</div>
	<ul class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.stories as story, i (story.slug)}
			<li><StoryCard {story} level={3} tilt={TILTS[i % TILTS.length]} /></li>
		{/each}
	</ul>
</section>

<section class="grid gap-12 py-12 md:grid-cols-2">
	<div>
		<h2 class="text-3xl font-semibold tracking-tight">About</h2>
		<p class="mt-4 text-lg leading-relaxed">{profile.bio[0]}</p>
		<a href="/about" class="mt-4 inline-block font-semibold underline underline-offset-4"
			>More about me →</a>
	</div>
	<div>
		<h2 class="text-3xl font-semibold tracking-tight">Experience</h2>
		<ol class="mt-4 divide-y divide-line">
			{#each recentRoles as role (role.org + role.start)}
				<li class="py-3">
					<p class="font-semibold">{role.org}</p>
					<p class="text-muted">{role.role} · {formatRange(role.start, role.end)}</p>
				</li>
			{/each}
		</ol>
		<a href="/resume" class="mt-4 inline-block font-semibold underline underline-offset-4"
			>Full resume →</a>
	</div>
</section>
```

- [ ] **Step 4: Verify**

Run: `pnpm build && pnpm preview`, then open http://localhost:4173/.

Expected:
- **Hero:** name `<h1>`, positioning line, two buttons.
- **Decorations:** the polaroid with "that's me!" and two sticky notes overlap without covering the buttons.
- **Featured:** three cards.
- **Below:** About teaser and a 3-role experience list.
- **At 375px:** single column, the hero decoration sits below the text, and there's no horizontal scroll.

- [ ] **Step 5: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src
git commit -m "feat: home page with hero, featured stories and teasers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Resume page

**Files:**
- Create: `src/routes/resume/+page.svelte`

**Interfaces:**
- Consumes: `profile`, `site`, `formatMonthYear`, `Seo`, `personRefJsonLd`

- [ ] **Step 1: Create the page**

`src/routes/resume/+page.svelte`. The headings are exactly Summary, Experience, Education, Skills (spec §7.5).

```svelte
<script>
	import Seo from '$lib/components/Seo.svelte';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { formatMonthYear } from '$lib/format.js';
	import { personRefJsonLd } from '$lib/seo/jsonld.js';

	const professional = profile.experience.filter((role) => !role.earlier);
	const earlier = profile.experience.filter((role) => role.earlier);
</script>

<Seo
	title="Resume"
	description="Resume of {profile.name}, {profile.headline} at {profile.worksFor.name}: experience, education and skills."
	path="/resume"
	jsonLd={[personRefJsonLd(site, profile)]} />

{#snippet roleEntry(role, level)}
	<article class="py-6">
		<div class="flex flex-wrap items-baseline justify-between gap-x-4">
			<svelte:element this={level} class="text-lg font-semibold">{role.org}</svelte:element>
			<p class="text-sm text-muted">{role.location}</p>
		</div>
		<div class="flex flex-wrap items-baseline justify-between gap-x-4">
			<p class="italic">{role.role}</p>
			<p class="text-sm text-muted">
				<time datetime={role.start}>{formatMonthYear(role.start)}</time> –
				{#if role.end}<time datetime={role.end}>{formatMonthYear(role.end)}</time>{:else}Present{/if}
			</p>
		</div>
		<ul class="mt-3 list-disc space-y-2 pl-5">
			{#each role.bullets as bullet (bullet.text)}
				<li>
					{#if bullet.label}<strong>{bullet.label}:</strong>{/if}
					{bullet.text}
				</li>
			{/each}
		</ul>
	</article>
{/snippet}

<article class="mx-auto max-w-3xl pt-12">
	<header class="border-b border-line pb-8">
		<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">{profile.name}</h1>
		<p class="mt-2 text-xl">{profile.headline}</p>
		<p class="mt-3 text-muted">
			{profile.location} ·
			<a href="mailto:{profile.email}" class="underline underline-offset-4">{profile.email}</a>
			{#if profile.links.linkedin}
				· <a href={profile.links.linkedin} class="underline underline-offset-4">LinkedIn</a>
			{/if}
		</p>
		<a
			href={site.resumePdf}
			download
			class="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-ink/85"
			>Download PDF</a>
	</header>

	<section class="border-b border-line py-8" aria-labelledby="summary">
		<h2 id="summary" class="text-2xl font-semibold tracking-tight">Summary</h2>
		<p class="mt-3 leading-relaxed">{profile.summary}</p>
	</section>

	<section class="border-b border-line py-8" aria-labelledby="experience">
		<h2 id="experience" class="text-2xl font-semibold tracking-tight">Experience</h2>
		{#each professional as role (role.org + role.start)}
			{@render roleEntry(role, 'h3')}
		{/each}
		<h3 class="mt-4 text-xl font-semibold tracking-tight">Earlier experience</h3>
		{#each earlier as role (role.org + role.start)}
			{@render roleEntry(role, 'h4')}
		{/each}
	</section>

	<section class="border-b border-line py-8" aria-labelledby="education">
		<h2 id="education" class="text-2xl font-semibold tracking-tight">Education</h2>
		<ul class="mt-2">
			{#each profile.education as entry (entry.institution)}
				<li class="py-3">
					<p class="font-semibold">{entry.institution}</p>
					<p class="text-muted">
						{entry.degree} · {entry.location} · Graduated
						<time datetime={entry.end}>{formatMonthYear(entry.end)}</time>
					</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="py-8" aria-labelledby="skills">
		<h2 id="skills" class="text-2xl font-semibold tracking-tight">Skills</h2>
		<dl class="mt-3 space-y-2">
			<div>
				<dt class="inline font-semibold">Tools:</dt>
				<dd class="inline">{profile.skills.tools.join(', ')}</dd>
			</div>
			<div>
				<dt class="inline font-semibold">Specialisms:</dt>
				<dd class="inline">{profile.skills.specialisms.join(', ')}</dd>
			</div>
		</dl>
	</section>
</article>
```

- [ ] **Step 2: Verify**

Run: `pnpm build && pnpm preview`, then open http://localhost:4173/resume.

Expected: all four roles and both degrees match the PDF wording; "Download PDF" downloads `Shivani-Illakiya-Resume.pdf`; no phone number appears (`grep -c 9360054825 build/resume.html` prints `0`).

Then turn off JavaScript (DevTools → Command menu → "Disable JavaScript") and reload. Expected: the page is identical.

- [ ] **Step 3: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src
git commit -m "feat: ATS-friendly HTML resume page with PDF download" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: About page and the 404 page

**Files:**
- Create: `src/routes/about/+page.svelte`, `src/routes/+error.svelte`

**Interfaces:**
- Consumes: `Polaroid`, `LuggageTag` styling conventions, `profile`, `site`, `Seo`, `profilePageJsonLd`, `absoluteUrl`, `portrait`

- [ ] **Step 1: Create the About page**

`src/routes/about/+page.svelte`:

```svelte
<script>
	import portrait from '$lib/assets/portrait.jpg?enhanced';
	import Polaroid from '$lib/components/Polaroid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { absoluteUrl, profilePageJsonLd } from '$lib/seo/jsonld.js';
</script>

<Seo
	title="About"
	description="About {profile.name}: {profile.headline} at {profile.worksFor.name}, covering food, travel and culture in Chennai."
	path="/about"
	type="profile"
	jsonLd={[profilePageJsonLd(site, profile, absoluteUrl(site.url, portrait.img.src))]} />

<section class="grid gap-12 pt-12 md:grid-cols-[1fr_1.5fr] md:items-start">
	<div class="mx-auto w-60 md:mt-6">
		<Polaroid src={portrait} alt="Portrait of Shivani Illakiya" caption="Chennai" tilt={-3} />
	</div>
	<div>
		<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">About</h1>
		{#each profile.bio as paragraph (paragraph)}
			<p class="mt-5 text-lg leading-relaxed">{paragraph}</p>
		{/each}

		<h2 class="mt-12 text-2xl font-semibold tracking-tight">What I cover</h2>
		<ul class="mt-4 flex flex-wrap gap-2">
			{#each profile.beats as beat (beat)}
				<li class="rounded-full border border-ink/20 bg-receipt px-4 py-1.5">{beat}</li>
			{/each}
		</ul>

		<div class="mt-10 flex flex-wrap gap-3">
			<a
				href="/stories"
				class="inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-ink/85"
				>Read my stories</a>
			<a
				href="/resume"
				class="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-6 font-semibold hover:border-ink"
				>View resume</a>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Create the error page**

`src/routes/+error.svelte`:

```svelte
<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Lost luggage' : 'Something went wrong'} · Shivani Illakiya</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-xl py-24 text-center">
	<div class="paper mx-auto inline-block" style:--tilt="-2deg">
		<div
			class="bg-tag py-6 pr-10 pl-14 text-left text-tag-ink [clip-path:polygon(24px_0,100%_0,100%_100%,24px_100%,0_50%)]">
			<p class="font-mono text-xs tracking-wider uppercase">Baggage claim · {page.status}</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight">
				{page.status === 404 ? 'Lost luggage' : 'Something went wrong'}
			</h1>
		</div>
	</div>
	<p class="mt-8 text-lg text-muted">
		{page.status === 404
			? "This page isn't on any flight we know of."
			: 'Please try again in a moment.'}
	</p>
	<p class="mt-6 flex justify-center gap-6">
		<a href="/" class="font-semibold underline underline-offset-4">Home</a>
		<a href="/stories" class="font-semibold underline underline-offset-4">Stories</a>
	</p>
</section>
```

- [ ] **Step 3: Verify**

Run: `pnpm build && ls build/404.html && pnpm preview`, then open http://localhost:4173/about and http://localhost:4173/nope.

Expected:
- `/about` shows the polaroid and bio.
- `/nope` shows the "Lost luggage" tag.
- In the Rich Results Test or Schema Markup Validator (paste the `/about` page source), a `ProfilePage` with `mainEntity` Person is detected with no errors.

- [ ] **Step 4: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src
git commit -m "feat: about page with ProfilePage markup and lost-luggage 404" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Sitemap, llms.txt and robots.txt (TDD)

**Files:**
- Create: `src/lib/seo/sitemap.js`, `src/lib/seo/llms.js`, `src/routes/sitemap.xml/+server.js`, `src/routes/llms.txt/+server.js`
- Modify: `static/robots.txt`
- Test: `src/lib/seo/sitemap.test.js`, `src/lib/seo/llms.test.js`

**Interfaces:**
- Consumes: `getStories`, `site`, `profile`, `TYPE_META`, `formatDate`
- Produces:
  - `sitemapEntries(stories) → { path, lastmod? }[]`
  - `buildSitemap(siteUrl, entries) → string`
  - `buildLlmsTxt({ site, profile, stories }) → string`

- [ ] **Step 1: Write the failing tests**

`src/lib/seo/sitemap.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { buildSitemap, sitemapEntries } from './sitemap.js';

describe('sitemap', () => {
	it('lists static pages and only indexable stories', () => {
		const entries = sitemapEntries([
			{ slug: 'a', date: '2026-10-03', indexable: true },
			{ slug: 'b', date: '2026-10-04', indexable: false }
		]);
		expect(entries.map((e) => e.path)).toEqual(['/', '/stories', '/about', '/resume', '/stories/a']);
		expect(entries.at(-1)).toEqual({ path: '/stories/a', lastmod: '2026-10-03' });
	});

	it('renders valid sitemap XML with absolute, escaped URLs', () => {
		const xml = buildSitemap('https://shivani-illakiya.com', [
			{ path: '/' },
			{ path: '/stories/a&b', lastmod: '2026-10-03' }
		]);
		expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
		expect(xml).toContain('<loc>https://shivani-illakiya.com/</loc>');
		expect(xml).toContain('<loc>https://shivani-illakiya.com/stories/a&amp;b</loc>');
		expect(xml).toContain('<lastmod>2026-10-03</lastmod>');
	});
});
```

`src/lib/seo/llms.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { profile } from '$lib/data/profile.js';
import { site } from '$lib/data/site.js';
import { buildLlmsTxt } from './llms.js';

const stories = [
	{
		slug: 'demo',
		title: 'Demo story',
		dek: 'A demo dek',
		type: 'food',
		date: '2026-10-03',
		publication: 'Indulge, The New Indian Express'
	}
];

describe('llms.txt', () => {
	const text = buildLlmsTxt({ site, profile, stories });

	it('follows the llmstxt.org shape: H1, blockquote, then H2 link lists', () => {
		const lines = text.split('\n');
		expect(lines[0]).toBe('# Shivani Illakiya');
		expect(lines[2]).toMatch(/^> Journalist and Food Correspondent at Indulge/);
		expect(text).toContain('## About');
		expect(text).toContain('## Selected stories');
		expect(text).toContain('## Contact');
	});

	it('links stories with their dek, type, date and publication', () => {
		expect(text).toContain(
			'- [Demo story](https://shivani-illakiya.com/stories/demo): A demo dek (Food, 3 Oct 2026, Indulge, The New Indian Express)'
		);
	});

	it('links the HTML and PDF resume and omits missing social links', () => {
		expect(text).toContain('(https://shivani-illakiya.com/resume)');
		expect(text).toContain('(https://shivani-illakiya.com/Shivani-Illakiya-Resume.pdf)');
		expect(text).not.toContain('LinkedIn');
	});
});
```

(The last assertion assumes `profile.links.linkedin` is still `null`. When the real URL is added, change it to `toContain('LinkedIn')`.)

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm test`
Expected: FAIL, cannot resolve `./sitemap.js` / `./llms.js`.

- [ ] **Step 3: Implement the builders**

`src/lib/seo/sitemap.js`:

```js
const STATIC_PATHS = ['/', '/stories', '/about', '/resume'];

/** @param {string} value */
function escapeXml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** @param {{ slug: string, date: string, indexable: boolean }[]} stories */
export function sitemapEntries(stories) {
	return [
		...STATIC_PATHS.map((path) => ({ path })),
		...stories
			.filter((story) => story.indexable)
			.map((story) => ({ path: `/stories/${story.slug}`, lastmod: story.date }))
	];
}

/**
 * @param {string} siteUrl
 * @param {{ path: string, lastmod?: string }[]} entries
 */
export function buildSitemap(siteUrl, entries) {
	const urls = entries.map(({ path, lastmod }) => {
		const loc = `    <loc>${escapeXml(new URL(path, siteUrl).href)}</loc>`;
		const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
		return `  <url>\n${loc}${mod}\n  </url>`;
	});
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}
```

`new URL('/stories/a&b', base).href` keeps `&` unescaped, so `escapeXml` produces `&amp;` as the test expects.

`src/lib/seo/llms.js`:

```js
import { TYPE_META } from '$lib/content/types.js';
import { formatDate } from '$lib/format.js';

/**
 * Build /llms.txt in the llmstxt.org format: H1, blockquote summary, prose, H2 link lists.
 * @param {{
 *   site: typeof import('$lib/data/site.js').site,
 *   profile: typeof import('$lib/data/profile.js').profile,
 *   stories: { slug: string, title: string, dek: string, type: string, date: string, publication: string | null }[]
 * }} input
 */
export function buildLlmsTxt({ site, profile, stories }) {
	/** @param {string} path */
	const abs = (path) => new URL(path, site.url).href;
	/** @param {string} label @param {string} href @param {string} [note] */
	const link = (label, href, note) => `- [${label}](${href})${note ? `: ${note}` : ''}`;

	const storyLines = stories.map((story) => {
		const details = [TYPE_META[story.type].label, formatDate(story.date), story.publication]
			.filter(Boolean)
			.join(', ');
		return link(story.title, abs(`/stories/${story.slug}`), `${story.dek} (${details})`);
	});

	return [
		`# ${profile.name}`,
		'',
		`> ${profile.headline} at ${profile.worksFor.name}, based in ${profile.location}. Writes about food, travel and culture.`,
		'',
		profile.summary,
		'',
		'## About',
		'',
		link('About', abs('/about'), 'Bio and the beats she covers'),
		link('Resume', abs('/resume'), 'Experience, education and skills'),
		link('Resume (PDF)', abs(site.resumePdf), 'Downloadable resume'),
		'',
		'## Selected stories',
		'',
		...storyLines,
		'',
		'## Contact',
		'',
		link('Email', `mailto:${profile.email}`),
		...(profile.links.linkedin ? [link('LinkedIn', profile.links.linkedin)] : []),
		...(profile.links.instagram ? [link('Instagram', profile.links.instagram)] : []),
		link('Published work on Indulge', site.indulgeAuthorUrl, 'Archive of all her bylines'),
		''
	].join('\n');
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Add the endpoints and robots.txt**

`src/routes/sitemap.xml/+server.js`:

```js
import { site } from '$lib/data/site.js';
import { getStories } from '$lib/server/stories.js';
import { buildSitemap, sitemapEntries } from '$lib/seo/sitemap.js';

export const prerender = true;

export function GET() {
	return new Response(buildSitemap(site.url, sitemapEntries(getStories())), {
		headers: { 'Content-Type': 'application/xml' }
	});
}
```

`src/routes/llms.txt/+server.js`:

```js
import { profile } from '$lib/data/profile.js';
import { site } from '$lib/data/site.js';
import { getStories } from '$lib/server/stories.js';
import { buildLlmsTxt } from '$lib/seo/llms.js';

export const prerender = true;

export function GET() {
	return new Response(buildLlmsTxt({ site, profile, stories: getStories() }), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
```

Replace `static/robots.txt`:

```
# Allow every search and AI crawler.
User-agent: *
Allow: /

Sitemap: https://shivani-illakiya.com/sitemap.xml
```

Every route now exists, so in `svelte.config.js` replace the whole `prerender` block with:

```js
		prerender: {
			// Endpoints aren't linked from pages, so list them explicitly. Broken links fail the build.
			entries: ['*', '/sitemap.xml', '/llms.txt']
		}
```

- [ ] **Step 6: Verify the build output**

```bash
pnpm build
cat build/llms.txt
cat build/sitemap.xml
cat build/robots.txt
```

Expected:
- The build prints no 404 warnings. (It would now fail on any broken link.)
- `llms.txt` starts with `# Shivani Illakiya` and lists all three stories.
- `sitemap.xml` lists `/`, `/stories`, `/about`, `/resume` and every story whose `indexable` is true.
- `robots.txt` has the `Sitemap:` line.

- [ ] **Step 7: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src static/robots.txt svelte.config.js
git commit -m "feat: generated sitemap.xml, llms.txt and robots sitemap line" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Delight: draggable hero and the signature draw

**Files:**
- Create: `src/lib/actions/draggable.js`, `src/lib/components/Signature.svelte`
- Modify: `src/lib/components/Polaroid.svelte`, `src/lib/components/StickyNote.svelte`, `src/routes/+page.svelte`

**Interfaces:**
- Consumes: the `data-drag-bounds` hero container (Task 9)
- Produces:
  - `use:draggable={{ enabled: boolean }}`
  - a `drag?: boolean` prop on `Polaroid` and `StickyNote`
  - `<Signature />` (decorative, `aria-hidden`)

- [ ] **Step 1: Create the draggable action**

`src/lib/actions/draggable.js`:

```js
/**
 * Make a decorative element draggable on desktop, with inertia, inside the nearest
 * [data-drag-bounds] ancestor. No-op on touch devices, with reduced motion, or when disabled.
 * GSAP is loaded lazily so pages without draggables never download it.
 * @param {HTMLElement} node
 * @param {{ enabled?: boolean }} [options]
 */
export function draggable(node, options = {}) {
	if (options.enabled === false) return;
	const allowed =
		window.matchMedia('(pointer: fine)').matches &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!allowed) return;

	/** @type {{ kill: () => void } | undefined} */
	let instance;
	let destroyed = false;

	Promise.all([import('gsap'), import('gsap/Draggable'), import('gsap/InertiaPlugin')]).then(
		([{ gsap }, { Draggable }, { InertiaPlugin }]) => {
			if (destroyed) return;
			gsap.registerPlugin(Draggable, InertiaPlugin);
			const bounds = node.closest('[data-drag-bounds]');
			[instance] = Draggable.create(node, {
				type: 'x,y',
				bounds: bounds ?? undefined,
				inertia: true,
				edgeResistance: 0.85,
				zIndexBoost: true,
				cursor: 'grab',
				activeCursor: 'grabbing'
			});
		}
	);

	return {
		destroy() {
			destroyed = true;
			instance?.kill();
		}
	};
}
```

- [ ] **Step 2: Add the `drag` prop to `Polaroid` and `StickyNote`**

Replace `src/lib/components/Polaroid.svelte`:

```svelte
<script>
	import { draggable } from '$lib/actions/draggable.js';

	/** @type {{ src: import('vite-imagetools').Picture, alt: string, caption?: string, tilt?: number, drag?: boolean, class?: string }} */
	let { src, alt, caption, tilt = 0, drag = false, class: className = '' } = $props();
</script>

<figure
	use:draggable={{ enabled: drag }}
	class="paper bg-receipt p-2.5 pb-3 {className}"
	style:--tilt="{tilt}deg">
	<enhanced:img {src} {alt} sizes="256px" class="pointer-events-none aspect-square w-full object-cover" />
	{#if caption}
		<figcaption class="mt-2 text-center font-hand text-2xl leading-none">{caption}</figcaption>
	{/if}
</figure>
```

Replace `src/lib/components/StickyNote.svelte`:

```svelte
<script>
	import { draggable } from '$lib/actions/draggable.js';

	/** @type {{ tilt?: number, color?: 'yellow' | 'blue', drag?: boolean, class?: string, children: import('svelte').Snippet }} */
	let { tilt = 0, color = 'yellow', drag = false, class: className = '', children } = $props();

	const colors = { yellow: 'bg-note text-note-ink', blue: 'bg-sky-200 text-sky-950' };
</script>

<div use:draggable={{ enabled: drag }} class="paper p-4 {colors[color]} {className}" style:--tilt="{tilt}deg">
	<p class="font-hand text-2xl leading-tight">{@render children()}</p>
</div>
```

In `src/routes/+page.svelte`, add `drag` to the hero's `<Polaroid …>` and both `<StickyNote …>` elements (e.g. `<StickyNote drag tilt={4} …>`).

- [ ] **Step 3: Create `Signature`**

Run `git show experiments:src/lib/components/Text.svelte` and copy every `<path … d="…" />` element (22 of them, one per `<g>`, spelling "Shivani Illakiya") into the `<svg>` below, in order. Drop their `class`, `stroke-linecap` and `<g>` wrappers; the `<svg>` sets the stroke styles.

`src/lib/components/Signature.svelte`:

```svelte
<script>
	import { onMount } from 'svelte';

	/** @type {SVGSVGElement} */
	let svg;

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let cancelled = false;
		Promise.all([import('gsap'), import('gsap/DrawSVGPlugin')]).then(([{ gsap }, { DrawSVGPlugin }]) => {
			if (cancelled) return;
			gsap.registerPlugin(DrawSVGPlugin);
			gsap.from(svg.querySelectorAll('path'), {
				drawSVG: 0,
				duration: 0.25,
				stagger: 0.04,
				ease: 'power1.inOut'
			});
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<svg
	bind:this={svg}
	aria-hidden="true"
	viewBox="0 0 100.8 15.7"
	fill="none"
	stroke="currentColor"
	stroke-width="0.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="h-auto w-56 overflow-visible text-ink sm:w-72">
	<!-- the 22 <path d="…" /> elements copied from experiments:src/lib/components/Text.svelte -->
</svg>
```

The comment marks where the copied paths go. Replace it with the paths; don't leave the comment in.

In `src/routes/+page.svelte`, import `Signature` and place `<Signature />` directly under the `<h1>` inside a `<div class="mt-3">`.

- [ ] **Step 4: Verify**

Run: `pnpm build && pnpm preview`, then open http://localhost:4173/ at desktop width.

Expected:
- The signature draws itself once (~1.2s).
- The polaroid and notes can be dragged with a mouse, glide with inertia, and stay inside the hero box.
- Page links and buttons still work.

Then check:
- **Reduced motion** (DevTools → Rendering): the signature appears already drawn, nothing is draggable, and cards don't tilt on hover.
- **375px mobile** (touch emulation): nothing is draggable and page scrolling works normally over the hero.

- [ ] **Step 5: Commit**

```bash
pnpm exec prettier --write src
pnpm exec eslint src
git add src
git commit -m "feat: draggable hero decorations and signature draw" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: README, final checks and the launch checklist

**Files:**
- Modify: `README.md` (full replacement)

- [ ] **Step 1: Replace `README.md`**

````markdown
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
venue: 'Rasanai, Chennai' # travel routes as 'MAS → YCD'
publication: 'Indulge, The New Indian Express' # omit for original pieces
sourceUrl: 'https://www.indulgexpress.com/…' # omit for original pieces
fullText: false # true only once republication is cleared
context: 'Optional 1–3 sentences on how the story was reported.'
featured: true # show on the home page
clipping: ./clipping.jpg # optional
images:
  - { src: ./photo-1.jpg, alt: 'What the photo shows', caption: 'Optional', credit: 'Shivani Illakiya' }
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
````

- [ ] **Step 2: Run the full automated check**

```bash
pnpm test
pnpm exec eslint src
pnpm exec prettier --check src
pnpm build
```

Expected: all pass. The build ends with `Wrote site to "build"`.

- [ ] **Step 3: Run the pre-launch checks locally**

With `pnpm preview` running:
- [ ] Lighthouse (Chrome DevTools, mobile) on `/`, `/stories`, one story and `/resume`: Performance, Accessibility, SEO ≥ 95 each.
- [ ] Keyboard only: Tab from the top reaches "Skip to content", the nav, every card and the footer links, with a visible focus ring each time.
- [ ] JavaScript disabled: every page shows all content, and `/stories` shows all cards.
- [ ] 375px width: no horizontal scroll on any page.
- [ ] `build/sitemap.xml` contains no story with `fullText: true` and a `sourceUrl`.

- [ ] **Step 4: Commit**

```bash
pnpm exec prettier --write README.md
git add README.md
git commit -m "docs: README for content, resume sync and deployment" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Hand the launch checklist to the user**

These are the user's (or Shivani's) actions, not code. Report them verbatim:

1. Shivani reviews the `bio`, `beats` and `highlights` copy in `src/lib/data/profile.js`, and sends her LinkedIn (and Instagram, if used for work) URLs to add to `profile.links`.
2. Replace the placeholder portrait (`src/lib/assets/portrait.jpg`) and `static/og.jpg` with real photos.
3. Replace or delete the placeholder stories (`culture-placeholder`, and the travel placeholder if one was created) with real pieces before pointing the domain.
4. Re-export the resume PDF from its source document with the site URL `shivani-illakiya.com` as plain text in the body and the document title set to "Shivani Illakiya — Resume". Save it over `static/Shivani-Illakiya-Resume.pdf`.
5. Buy `shivani-illakiya.com` at Cloudflare, add it to the Vercel project, create the records as DNS-only (grey cloud), and merge `redesign` into `main` to deploy.
6. On the live domain: run the Rich Results Test on `/`, `/about`, `/resume` and one story; open `/llms.txt`, `/sitemap.xml`, `/robots.txt` and the PDF; visit an unknown URL and confirm the "Lost luggage" page.
7. Verify the domain in Google Search Console and Bing Webmaster Tools and submit `https://shivani-illakiya.com/sitemap.xml` to both.
8. Add the site URL to Shivani's LinkedIn, her Naukri profile headline and her Indulge author bio.
9. Revoke the old Hygraph token in the Hygraph dashboard.
