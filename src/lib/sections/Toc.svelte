<script lang="ts">
	import { sections } from '$lib/data/section-titles';

	const entries = [
		{ href: '#sites', page: '3', ...sections.sites },
		{ href: '#season', page: '4', ...sections.notes },
		{ href: '#archive', page: '5', ...sections.archive },
		{ href: '#columns', page: '6', ...sections.columns },
		{ href: '#contributors', page: '7', ...sections.contributors },
		{ href: '#awards', page: '8', ...sections.awards }
	];
</script>

<section id="toc" class="toc">
	<h2 class="font-display text-2xl font-bold">
		{sections.toc.title} <span class="h2tag font-hand">{sections.toc.tag}</span>
	</h2>
	<ol>
		{#each entries as e}
			<li>
				<a href={e.href}>{e.title}</a>
				<span class="entrytag font-hand">{e.tag}</span>
				<span class="dots" aria-hidden="true"></span>
				<span class="pg font-hand">p. {e.page}</span>
			</li>
		{/each}
	</ol>
</section>

<style>
	.toc {
		max-width: var(--measure);
		margin-inline: auto;
		padding-inline: 1.25rem;
	}
	ol {
		margin-top: var(--leading);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	li {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}
	a {
		text-decoration: none;
		color: var(--color-blue);
	}
	a:hover {
		color: var(--color-pink);
	}
	.dots {
		flex: 1;
		border-bottom: 2px dotted var(--color-pink);
		transform: translateY(-0.3em);
	}
	.pg {
		font-size: 0.85rem;
	}
	.entrytag {
		font-size: 0.8rem;
		color: var(--color-pink);
	}
</style>
