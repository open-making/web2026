<script lang="ts">
	const entries = [
		{ href: '#season', page: '3', label: 'the season' },
		{ href: '#sites', page: '4', label: 'the seven sites' },
		{ href: '#archive', page: '5', label: 'from the archive' },
		{ href: '#columns', page: '6', label: 'the columns' },
		{ href: '#contributors', page: '7', label: 'contributors' }
	];
</script>

<section id="toc" class="toc">
	<h2 class="font-display text-2xl font-bold">in this issue</h2>
	<ol>
		{#each entries as e}
			<li>
				<a href={e.href}>{e.label}</a>
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
</style>
