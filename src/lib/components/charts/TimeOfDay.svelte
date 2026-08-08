<script lang="ts">
	// When the notes got written: one dot per note, stacked over its IST hour like
	// tally marks. The axis runs 6am → 6am so the late-night cluster sits together
	// on the right instead of wrapping around midnight.
	// D3 for the math (scales), Svelte for the DOM.
	import { scaleBand, scaleLinear } from 'd3';

	let { hours, annotation = '' }: { hours: number[]; annotation?: string } = $props();

	// display order: 6am through 5am the next morning
	const order = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);

	let width = $state(640);
	const H = 230;
	const PAD = { top: 20, right: 12, bottom: 34, left: 12 };

	const x = $derived(
		scaleBand<number>()
			.domain(order)
			.range([PAD.left, width - PAD.right])
			.paddingInner(0.25)
	);
	const y = $derived(
		scaleLinear()
			.domain([0, Math.max(...hours)])
			.range([H - PAD.bottom, PAD.top])
	);
	const dotR = $derived(Math.min(4.5, x.bandwidth() * 0.38));
	// vertical gap between stacked dots, capped so tall stacks fit the frame
	const step = $derived(Math.min(dotR * 2 + 3, (H - PAD.top - PAD.bottom) / Math.max(...hours)));

	// the after-midnight stretch, 12am–5am, sits at the right end of the axis
	const midnightX = $derived(x(0)! - (x.step() * x.paddingInner()) / 2);

	const ticks = [6, 12, 18, 0];
	const tickLabel = (h: number) =>
		h === 0 ? '12am' : h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`;
</script>

<figure bind:clientWidth={width}>
	<svg
		viewBox="0 0 {width} {H}"
		role="img"
		aria-label="Notes posted by hour of day (IST), one dot per note"
	>
		<rect
			x={midnightX}
			y={PAD.top - 8}
			width={width - PAD.right - midnightX}
			height={H - PAD.bottom - PAD.top + 8}
			class="midnight"
		/>
		{#each order as h}
			{#each { length: hours[h] } as _, i}
				<circle
					cx={x(h)! + x.bandwidth() / 2}
					cy={H - PAD.bottom - dotR - 1 - i * step}
					r={dotR}
					class="dot"
				/>
			{/each}
		{/each}
		<line
			x1={PAD.left}
			y1={H - PAD.bottom}
			x2={width - PAD.right}
			y2={H - PAD.bottom}
			class="axis"
		/>
		{#each ticks as t}
			<text x={x(t)! + x.bandwidth() / 2} y={H - PAD.bottom + 22} class="tick">{tickLabel(t)}</text>
		{/each}
		{#if width >= 420}
			<text x={(midnightX + width - PAD.right) / 2} y={PAD.top} class="note">after midnight</text>
		{/if}
	</svg>
</figure>

<style>
	figure {
		width: 100%;
	}
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.dot {
		fill: var(--color-pink);
		mix-blend-mode: multiply;
	}
	.midnight {
		fill: var(--color-violet);
		opacity: 0.1;
		mix-blend-mode: multiply;
	}
	.axis {
		stroke: var(--color-blue);
		stroke-width: 2;
		stroke-dasharray: 6 4;
	}
	.tick {
		font-family: var(--font-hand);
		font-size: 13px;
		fill: var(--color-blue);
		text-anchor: middle;
	}
	.note {
		font-family: var(--font-hand);
		font-size: 13px;
		fill: var(--color-violet);
		text-anchor: middle;
	}
	figcaption {
		margin-top: 0.5rem;
		font-size: 0.95rem;
		color: var(--color-pink);
		text-align: center;
	}
</style>
