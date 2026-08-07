<script lang="ts">
	// How long the notes ran: horizontal bars per word-count bucket.
	// D3 for the scale math; the bars are plain divs, so width is naturally fluid.
	import { scaleLinear } from 'd3';

	let { buckets }: { buckets: { label: string; count: number }[] } = $props();
	const w = scaleLinear()
		.domain([0, Math.max(...buckets.map((b) => b.count))])
		.range([0, 100]);
</script>

<div class="rows" role="img" aria-label="Note length distribution in words">
	{#each buckets as b}
		<div class="row">
			<span class="label font-hand">{b.label} words</span>
			<div class="track">
				<div class="bar" style="width: {w(b.count)}%"></div>
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
