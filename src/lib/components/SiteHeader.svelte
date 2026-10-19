<script>
	import { page } from '$app/state';
	import { site } from '$lib/data/site.js';
	import favicon from '$lib/assets/favicon.svg'

	const links = [
		{ href: '/stories', label: 'Stories' },
		{ href: '/about', label: 'About' },
		{ href: '/resume', label: 'Resume' },
		// { href: '#contact', label: 'Contact' }
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
	<a href="/" class="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight">
		<!-- {site.name} -->
		<img src={favicon} class="w-full h-10" alt="">
	</a>
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
