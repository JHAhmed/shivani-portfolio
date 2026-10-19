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
