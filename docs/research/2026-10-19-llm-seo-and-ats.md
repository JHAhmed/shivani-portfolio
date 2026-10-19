# LLM/search visibility and ATS readiness for shivani-illakiya.com

Research date: 2026-10-19. Sources are primary (vendor or standards docs) unless marked **[secondary]**. "Updated" dates are the dates shown on the page when it was fetched.

## TL;DR for building this site

1. **Do** serve a plain allow-all `robots.txt` with a `Sitemap:` line. Don't block any named AI bot. Blocking training bots (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot) doesn't change search inclusion, so allowing them is optional.
2. **Do** check that the Cloudflare DNS records for the domain are **DNS-only (grey cloud)**. Cloudflare's AI-bot blocking only applies to traffic it proxies. On Vercel, leave the "AI bots" managed ruleset on its default (Allow/off).
3. **Do** put all key facts (name, title, employer, beats, contact) in real HTML text. Don't put them only in images or SVGs. The `name.svg` heading needs a text equivalent.
4. **Do** use one `Person` entity with a stable `@id`. Put it inside `ProfilePage` on /about and point `Article.author.url` at /about. Don't expect a rich result from it. Its job is helping Google understand who she is.
5. **Don't** use cross-domain `rel=canonical` for full-text republished Indulge articles. Google's current syndication guidance is to block indexing of the copy, so use `noindex`. Better still, publish excerpts with original framing that link to Indulge.
6. **Do** ship `/llms.txt`. It's cheap and Lighthouse checks for it, but Google says Search ignores it and no AI provider says it reads it. **Don't** build `llms-full.txt`, which isn't in the spec.
7. **Don't** add "GEO" hacks: chunked content, AI-only files, or bought mentions. Google says AI features run on normal Search ranking and need no special optimization.
8. **Do** assume ATSs read only the uploaded file. Make the PDF text-based and single-column, with name and contact in the body (not the page header) and standard headings. Put the site URL in the PDF as plain text.
9. **Do** verify the site in Google Search Console and Bing Webmaster Tools, and submit the sitemap to both.
10. **Do** keep the /resume HTML and the PDF in sync. Structured data must match visible text.

---

## 1. llms.txt

**What the spec says.** llmstxt.org is now "version 2", modified 2026-08-10. It was originally proposed by Jeremy Howard on 2024-09-03 ([llmstxt.org](https://llmstxt.org/)). The format:

- A Markdown file at the site root, or at a subpath for that section.
- An H1 with the site name, which is the only required element.
- An optional blockquote summary, then optional prose with no headings.
- H2 sections of `[name](url): notes` link lists. An H2 named `Optional` marks links an agent can skip.

The spec also proposes clean Markdown copies of pages at `page.md` / `index.html.md`. Clients find them through `<link rel="alternate" type="text/markdown">`, and find the covering llms.txt through `rel="describedby"` ([llmstxt.org](https://llmstxt.org/)). The v2 page does **not** mention `llms-full.txt` or `llms-ctx*.txt`.

**Who reads it (status at 2026-10-19):**

| Provider | Official position |
|---|---|
| Google Search | Ignores it. Creating one "will neither harm nor help your site's visibility or rankings in Google Search." This note was added June 2026 ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated 2026-07-10). The AI features page says you don't need "AI text files" ([AI features](https://developers.google.com/search/docs/appearance/ai-features), updated 2025-12-10). |
| Google Chrome / Lighthouse | The experimental "Agentic Browsing" category runs a pass/fail check for `/llms.txt` at the domain root ([Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring), updated 2026-05-05). That's a tooling audit, not a ranking signal. |
| OpenAI | The crawler docs mention llms.txt only as a link to OpenAI's own docs index. They say nothing about crawlers reading it ([OpenAI bots](https://developers.openai.com/api/docs/bots)). |
| Anthropic | The crawler help article doesn't mention it ([Anthropic crawlers](https://support.claude.com/en/articles/8896518), updated 2026-04-07). |
| Perplexity | The bots page doesn't mention it ([Perplexity bots](https://docs.perplexity.ai/guides/bots)). |

llmstxt.org says OpenAI, Anthropic and Gemini *publish* llms.txt files for their developer docs. It doesn't claim any of them *consume* other sites' files.

**Recommendation.** Ship a short `/llms.txt`: H1 name, a one-paragraph blockquote bio, and H2 sections for About, Resume (HTML and PDF), Selected stories, and Contact. It costs little and passes the Lighthouse check. Skip `llms-full.txt`. Treat `.md` companion pages as optional, low priority.

**Repo note:** `llms.txt` currently sits empty at the repo root. SvelteKit serves static files from `static/`, so as it stands it won't be deployed. Move it to `static/llms.txt` or generate it from a prerendered `+server.js` route.

## 2. AI crawler user agents

| Token | Purpose | robots.txt | Source |
|---|---|---|---|
| `OAI-SearchBot` | ChatGPT search inclusion | Honored. Sites that opt out "will not be shown in ChatGPT search answers". Changes take about 24h. | [OpenAI](https://developers.openai.com/api/docs/bots) |
| `GPTBot` | Training | Honored. Settings are independent of each other. | same |
| `ChatGPT-User` | User-initiated fetches | "robots.txt rules may not apply". Not used for search inclusion. | same |
| `ClaudeBot` | Training | Honored. Also supports `Crawl-delay`. | [Anthropic](https://support.claude.com/en/articles/8896518) |
| `Claude-SearchBot` | Search indexing | Honored. Blocking it may reduce visibility in search. | same |
| `Claude-User` | User-initiated fetches | Honored per Anthropic. Blocking it reduces visibility in user-directed search. | same |
| `Googlebot` | Google Search, including AI Overviews and AI Mode | Honored | [Google crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) (updated 2026-10-15), [AI features](https://developers.google.com/search/docs/appearance/ai-features) |
| `Google-Extended` | Control token only, no separate crawler. Covers Gemini training and grounding. | "does not impact a site's inclusion in Google Search nor is it used as a ranking signal" | [Google crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) |
| `PerplexityBot` | Perplexity search results, not training | Honored. Perplexity recommends allowing it. | [Perplexity](https://docs.perplexity.ai/guides/bots) |
| `Perplexity-User` | User-initiated fetches | "generally ignores robots.txt" | same |
| `Applebot` | Spotlight, Siri and Safari search | Honored | [Apple](https://support.apple.com/en-us/119829) (dated 2026-09-04) |
| `Applebot-Extended` | Training opt-out only. "does not crawl webpages". | Disallowing it doesn't affect search. | same |
| `CCBot` | Common Crawl open dataset | Common Crawl documents `Disallow` for CCBot | [Common Crawl](https://commoncrawl.org/ccbot) |

The Common Crawl page doesn't mention AI training. That its dataset is widely used for training is common knowledge, not stated on the source page.

**Training vs answers.** For search and answer inclusion, allow `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot` and `Applebot`. Bing is also in this group: its guidelines cover Copilot (see section 6). Training is controlled separately by `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended` and `CCBot`. User-triggered fetchers (`ChatGPT-User`, `Perplexity-User`) may ignore robots.txt anyway.

**Recommended robots.txt** (maximum visibility):

```
User-agent: *
Allow: /

Sitemap: https://shivani-illakiya.com/sitemap.xml
```

The wildcard group already covers every bot above. You don't need named groups. If you add one later, a crawler follows only its most specific matching group, so each named group must repeat the rules. Whether to also allow the training bots is a personal choice. Allowing them doesn't hurt visibility. The idea that it *helps*, because models "know" her better, is **speculation**.

## 3. Cloudflare and Vercel bot blocking

**Cloudflare history:**

- **2025-07-01 ("Content Independence Day").** Cloudflare changed its default "to block AI crawlers unless they pay creators" ([blog](https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/)). It also began asking every new domain at signup whether to allow AI crawlers ([press release](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/)).
- **2026-07-01.** The single "Block AI bots" toggle was replaced by three policies: **Search**, **Agent** and **Training**. Each can be set to Allow, Block on all pages, or Block on pages with ads. All plans get them, including Free ([changelog](https://developers.cloudflare.com/changelog/post/2026-07-01-ai-traffic-options/); [Block AI Bots docs](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/), updated 2026-07-01).
- **2026-09-15.** New domains default to Training and Agent blocked *on pages with ads*, with Search allowed. Mixed-purpose crawlers are judged on all their behaviors. Cloudflare says Googlebot, Applebot and Bingbot would be blocked for customers who block Training ([blog](https://blog.cloudflare.com/content-independence-day-ai-options/)).

**Managed robots.txt.** This feature prepends Cloudflare's directives to your own robots.txt. It's driven by "Bot Preference Sync" and the default managed content signal is `search=yes, ai-train=no`. Free-plan zones without their own robots.txt serve a neutral Content Signals Policy ([managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/), updated 2026-10-08).

**Where to look in the dashboard:** Security Settings, then "Configure AI bot policies" (Search/Agent/Training) and "Enable Bot Preference Sync". The legacy setting is Security Settings, then "Block AI bots".

**Proxied vs DNS-only.** None of the AI-bot pages address it directly. Cloudflare's proxy docs say that for DNS-only records Cloudflare "cannot optimize, cache, and protect those requests", and that product settings apply only to proxied traffic ([proxy status](https://developers.cloudflare.com/dns/proxy-status/)). **Inference:** with grey-cloud records pointing at Vercel, neither the AI-bot policies nor managed robots.txt can touch the traffic. Vercel also recommends DNS-only rather than proxying ([Vercel KB](https://vercel.com/kb/guide/cloudflare-with-vercel), updated 2026-10-19).

**Vercel defaults:** Both rulesets are off by default ([Vercel bot management](https://vercel.com/docs/bot-management), updated 2026-09-10):

- The **AI bots managed ruleset** is labeled "Allow" in the dashboard.
- The **Bot Protection ruleset** is labeled "Off". It excludes verified bots, and Vercel's verified directory lists GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Googlebot, Google-Extended and CCBot.

Bot Protection "doesn't work" behind a reverse proxy such as Cloudflare. Check the live state under Firewall → Rules, or with `vercel firewall bot-management`.

**Recommendation.** Keep the Cloudflare records grey-cloud. If they're ever switched to orange, set Search, Agent and Training to Allow, and leave Bot Preference Sync off. On Vercel, leave both rulesets at their defaults.

## 4. Google structured data

- **ProfilePage** ([docs](https://developers.google.com/search/docs/appearance/structured-data/profile-page), updated 2026-09-08). It's built for creator profiles. Google ties it to Perspectives and discussion features ([search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)).
  - Valid uses include a blog "About Me" page and a news-site author page. The page must focus on one person affiliated with the site.
  - Required: `mainEntity` (Person) and `name`.
  - Recommended: `dateCreated`/`dateModified`, plus on the Person `alternateName`, `description`, `identifier`, `image` (16x9, 4x3 and 1x1), `sameAs`, and interaction statistics.
  - For a portfolio, expect **no visible rich result**. The value is helping Google understand the entity.
- **Person properties.** `jobTitle`, `worksFor`, `alumniOf`, `knowsAbout`, `hasOccupation` and `hasCredential` are all valid on schema.org Person ([schema.org/Person](https://schema.org/Person), v30.1). Google's docs don't list them for any feature. **Unverified** whether Google uses them, so treat them as harmless context. Google's Article docs do say job titles belong in `jobTitle`, not in `name`.
- **Article** ([docs](https://developers.google.com/search/docs/appearance/structured-data/article), updated 2026-09-08). No properties are required. Recommended: `headline`, `image`, `datePublished`/`dateModified`, and `author`. Google can show better titles, images and dates from it, but doesn't guarantee that. Author best practices:
  - Use `Person` with `url` or `sameAs`.
  - `author.url` should point to "a web page that uniquely identifies the author". If that's an internal profile page, "we recommend marking up that author using profile page structured data".
  - "Google can understand both sameAs and url when disambiguating authors."
  - List each author separately, keep `name` to the name only, and put the publisher in `publisher`.
- **Journalist-specific.** The author-page pattern (Article.author.url to a ProfilePage) is what Google documents. `sameAs` is the place for her Indulge/TNIE author page, LinkedIn, Muck Rack and X.

## 5. Canonicals for republished content

- Google's current guidance: "The canonical link element is not recommended for those who want to avoid duplication by syndication partners... The most effective solution is for partners to block indexing of your content" ([canonicalization troubleshooting](https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting), updated 2026-08-21).
- This change dates to a 2023-05-02 documentation update. In June 2023 office hours, Google recommended `noindex` on syndicated copies ([office hours](https://developers.google.com/search/help/office-hours/2023/june)).
- Canonical is "a hint, not a rule" ([canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization), updated 2026-08-20).

**For Shivani:**

- **Full-text copies.** Use `<meta name="robots" content="noindex, follow">`, leave them out of the sitemap, and show a visible "Originally published in Indulge" link. Don't use a cross-domain canonical. Indulge already holds the ranking copy, and `noindex` also keeps the copy out of ChatGPT search ([OpenAI publisher FAQ](https://help.openai.com/en/articles/12627856), reached via search, page returned 403). Full-text republication may need Indulge's permission. That's a rights question, not an SEO one, and it's **unverified** whether she has it.
- **Excerpt pages.** Self-canonical is fine. Make them worth indexing: her own summary or notes on reporting the story, plus a prominent link to the original. These are her unique pages for AI and search to cite.

## 6. AI search visibility ("GEO")

**Documented by first parties:**

- **Google.** "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." Pages must be indexed and snippet-eligible ([AI features](https://developers.google.com/search/docs/appearance/ai-features)). Google's advice:
  - Allow crawling in robots.txt and the CDN.
  - Use internal links.
  - Keep important content in text.
  - Make structured data match the visible text.
  - Verify the site in Search Console. AI traffic appears under "Web" there, and there's a Generative AI performance report ([blog 2026-06](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)).

  The [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) lists things you **don't** need: llms.txt, special schema, "chunking", rewriting for AI, inauthentic mentions, and third-party "AEO/GEO" hacks. It recommends original, experience-based content.
- **OpenAI.** Allow `OAI-SearchBot` and its published IP ranges at the host or CDN. Placement isn't guaranteed. Referrals carry `utm_source=chatgpt.com` ([OpenAI bots](https://developers.openai.com/api/docs/bots); help center articles [9237897](https://help.openai.com/en/articles/9237897-chatgpt-search) and [12627856](https://help.openai.com/en/articles/12627856), seen in search snippets only because direct fetches returned 403).
- **Perplexity.** Allow `PerplexityBot` ([docs](https://docs.perplexity.ai/guides/bots)).
- **Bing/Copilot.** Bing's webmaster guidelines cover how content surfaces in Bing, Copilot and grounding results. Bing Webmaster Tools has an "AI Performance" citation report (preview since Feb 2026). Bing recommends IndexNow and sitemaps with accurate `lastmod` ([Bing blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), [IndexNow](https://www.bing.com/webmasters/help/indexnow-0z209wby)). These pages didn't render in my fetch, so the details come from search-result summaries. **Partly verified.**

**Speculation (not documented by any provider):**

- Consistent entity facts across her site, LinkedIn, the Indulge author page and Muck Rack improve how LLMs describe her. This is plausible, and Google's sameAs disambiguation note partly supports it.
- Q&A/FAQ formatting, "citation-worthy" stats, and llms.txt raise AI citation rates.
- Being in training data improves model recall of her.

## 7. ATS: what gets read

**Do ATSs crawl portfolio URLs?** No vendor doc I found says they crawl or parse candidate websites.

- Greenhouse stores "Websites" and "Social media links" as candidate profile fields ([Greenhouse fields](https://support.greenhouse.io/hc/en-us/articles/360001421452-System-default-fields-vs-custom-fields)). MyGreenhouse lets candidates save portfolio links for autofill ([FAQ](https://support.greenhouse.io/hc/en-us/articles/43418495049499-MyGreenhouse-FAQ-for-Candidates)).
- Parsing operates on the uploaded file. The site URL is a link a human recruiter clicks.

**Vendor parsing guidance:**

- **Greenhouse:** accepts .doc, .docx, .pdf, .rtf and .txt, up to 100 MB ([support](https://support.greenhouse.io/hc/en-us/articles/360052218132-Supported-file-types-for-resumes-and-cover-letters), updated 2026-08-19). A 2.5 MB parse limit cited by third parties is **not** on the official page.
- **Workday:** "For best results, use resumes that don't have images or image-based styles." It doesn't auto-fill Languages or Skills ([Workday admin guide](https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/candidates/set-up-prospects-and-candidates/hdc1552497830785.html)).
- **Lever:** parses Word, PDF, RTF, HTML and ODF. It can't parse images. "If you cannot highlight text in a document, it is likely not parseable" ([Lever help](https://help.lever.co/hc/en-us/articles/20087345054749), via search snippet because the page failed to render).
- **iCIMS:** recommends .doc, .docx, .odt, .pdf, .rtf and .txt. A name placed only in the document header may not be read, and a resume with no detected name is rejected. Errors are most common with text boxes, images and tables ([iCIMS community](https://community.icims.com/articles/HowTo/Creating-New-Candidates-via-Bulk-File-Transfer-Migrating-Legacy-Resumes-during-Implementation), behind login, via search snippet).
- **Oracle Taleo:** uses a third-party parser. Admins can cap file size, 100 KB in older docs ([Taleo docs](https://docs.oracle.com/en/cloud/saas/talent-acquisition/17.6/otrec/candidate-management.html)). Version-dependent.
- **SmartRecruiters:** no official parsing doc found.

**PDF rules supported by vendor docs:** use a text-based (selectable) PDF; no images, text boxes or tables for content; name and contact in the body, not the header. Single column and standard headings are consistent with these docs but stated outright only by **[secondary]** guides. I found no vendor guidance on fonts or file naming. A name like `Shivani-Illakiya-Resume.pdf` is convention, not a documented requirement.

**India.** Naukri's own blog treats the profile itself as "your online resume". It has a resume headline field of up to 250 characters ([Naukri blog](https://www.naukri.com/blog/time-to-revisit-your-profile-on-naukri/)). For a Chennai journalist, a keyword-rich Naukri headline and a complete LinkedIn profile linking to the site likely matter more than site markup (**judgment**). Whether Naukri parses PDF or DOCX better is disputed in secondary sources and **unverified**.

## 8. Marking up the HTML resume page

- Google documents no resume or CV markup. The only Google feature using `EducationalOccupationalCredential` and `OccupationalExperienceRequirements` is employer-side `JobPosting` ([JobPosting docs](https://developers.google.com/search/docs/appearance/structured-data/job-posting)).
- schema.org has the building blocks:
  - Person `hasOccupation` (Occupation), `hasCredential`, `alumniOf`, `worksFor`, and `award` ([Person](https://schema.org/Person)).
  - `OrganizationRole`, which wraps `worksFor`/`alumniOf` with `startDate`, `endDate` and `roleName` ([OrganizationRole](https://schema.org/OrganizationRole)).
- **Recommendation.** On /resume, use semantic HTML: `<h1>` name, `<h2>` sections, `<article>` per role with `<time datetime>`. Reference the same `Person` by `@id`, adding `worksFor` (Indulge / The New Indian Express), `alumniOf`, `jobTitle`, `knowsAbout` (food, restaurants, culture, Chennai) and `sameAs`. OrganizationRole is optional. It's valid schema.org but gives no documented Google benefit.

## Changes to the current plan

1. **Full-text story pages:** replace the cross-domain canonical to Indulge with `noindex, follow`, leave them out of `sitemap.xml`, and keep a visible link to the original. Better: default to excerpt pages and confirm republication rights with Indulge.
2. **Excerpt pages:** keep self-canonical, but add her own original framing so they're worth indexing.
3. **Person JSON-LD:** define one Person with a stable `@id` (e.g. `https://shivani-illakiya.com/#person`), with full detail in the /about ProfilePage. Home, resume and Article pages reference it. `Article.author` should carry `url` set to /about, `publisher` set to Indulge, and the title in `jobTitle` only.
4. **llms.txt:** move from the repo root (currently empty, and not served) to `static/llms.txt` or a prerendered route. Follow the v2 format. Don't build `llms-full.txt`.
5. **robots.txt:** keep the existing allow-all `static/robots.txt`, add the `Sitemap:` line, and don't add per-bot groups.
6. **Infra checks (new):** confirm the Cloudflare records are grey-cloud, and that Vercel's AI-bot and Bot Protection rulesets are off. Add Google Search Console and Bing Webmaster Tools.
7. **Text, not images:** make sure the name heading rendered from `name.svg` has a real-text `<h1>` or accessible text.
8. **Resume PDF:** text-based and single-column, name and contact in the body, site URL as plain text. Rename to something like `Shivani-Illakiya-Resume.pdf` (convention). Keep it in sync with /resume.

## Open questions / unverified

- Whether Cloudflare's AI-bot policies and managed robots.txt can act on DNS-only records. That they can't is inferred from the proxy docs, not stated on the AI pages. Also unverified: whether the 2026-09-15 defaults apply to zones created before that date.
- Exact text of OpenAI help articles 12627856 and 9237897 (403), the Bing webmaster guidelines (didn't render), the Lever article (didn't render) and the iCIMS article (login). All were read via search snippets.
- No primary source found on whether Anthropic, OpenAI or Perplexity read llms.txt when answering. Their docs are silent.
- No vendor docs found on ATS fonts, file naming or columns, or on SmartRecruiters parsing. Naukri's parser preferences are also undocumented.
- Whether Google uses `knowsAbout`, `alumniOf`, `worksFor` or `hasOccupation` for anything is not documented.
- Whether Shivani has rights from The New Indian Express to republish full text.
