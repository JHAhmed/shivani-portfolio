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
	description="Resume of {profile.name}, {profile.headline} at {profile.worksFor
		.name}: experience, education and skills."
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
				{#if role.end}<time datetime={role.end}>{formatMonthYear(role.end)}</time
					>{:else}Present{/if}
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
