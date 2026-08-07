<script lang="ts">
	// How long the notes ran: horizontal bars per word-count bucket.
	let { buckets }: { buckets: { label: string; count: number }[] } = $props();
	const max = Math.max(...buckets.map((b) => b.count));
</script>

<div class="rows" role="img" aria-label="Note length distribution in words">
	{#each buckets as b}
		<div class="row">
			<span class="label font-hand">{b.label} words</span>
			<div class="track">
				<div class="bar" style="width: {(b.count / max) * 100}%"></div>
			</div>
			<span class="n font-hand">{b.count}</span>
		</div>
	{/each}
</div>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.row {
		display: grid;
		grid-template-columns: 7.5rem 1fr 2rem;
		align-items: center;
		gap: 0.75rem;
	}
	.label {
		font-size: 0.9rem;
		text-align: right;
	}
	.track {
		border-left: 2px solid var(--color-blue);
	}
	.bar {
		height: 1.35rem;
		background: var(--color-blue);
		mix-blend-mode: multiply;
		min-width: 2px;
	}
	.row:nth-child(odd) .bar {
		background: var(--color-pink);
	}
	.n {
		font-size: 0.9rem;
		color: var(--color-pink);
	}
</style>
