<script lang="ts">
	// When the notes got written: 24 IST hour bins, one pink bar each.
	let { hours, annotation = '' }: { hours: number[]; annotation?: string } = $props();

	const W = 640;
	const H = 220;
	const PAD = { top: 28, right: 12, bottom: 34, left: 12 };
	const max = Math.max(...hours);
	const bw = (W - PAD.left - PAD.right) / 24;
	const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
	const ticks = [0, 6, 12, 18];
	const tickLabel = (h: number) => (h === 0 ? '12am' : h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`);
</script>

<figure>
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Notes posted by hour of day (IST)">
		{#each hours as count, h}
			{#if count > 0}
				<rect
					x={PAD.left + h * bw + 2}
					y={y(count)}
					width={bw - 4}
					height={H - PAD.bottom - y(count)}
					class="bar"
				/>
				<text x={PAD.left + h * bw + bw / 2} y={y(count) - 6} class="count">{count}</text>
			{/if}
		{/each}
		<line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} class="axis" />
		{#each ticks as t}
			<text x={PAD.left + t * bw + bw / 2} y={H - PAD.bottom + 22} class="tick">{tickLabel(t)}</text>
		{/each}
	</svg>
	{#if annotation}
		<figcaption class="font-hand">{annotation}</figcaption>
	{/if}
</figure>

<style>
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.bar {
		fill: var(--color-pink);
		mix-blend-mode: multiply;
	}
	.axis {
		stroke: var(--color-blue);
		stroke-width: 2;
		stroke-dasharray: 6 4;
	}
	.count {
		font-family: var(--font-hand);
		font-size: 12px;
		fill: var(--color-blue);
		text-anchor: middle;
	}
	.tick {
		font-family: var(--font-hand);
		font-size: 13px;
		fill: var(--color-blue);
		text-anchor: middle;
	}
	figcaption {
		margin-top: 0.5rem;
		font-size: 0.95rem;
		color: var(--color-pink);
		text-align: center;
	}
</style>
