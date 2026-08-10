<script lang="ts">
	import PosterFrame from '$lib/components/PosterFrame.svelte';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';
	import { studentWork } from '$lib/utils/images';
	import { studentUrl } from '$lib/data/collateral';
	import manifest from '../../../../../../content/screenshots.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';
	import finalIndex from '$lib/assets/images/final/index.json';

	let { data } = $props();
	const { student, quote, orientation, qr } = data;
	const land = orientation === 'landscape';
	const url = studentUrl(student.slug);
	const tilt = (k: string, r = 3) => ((mulberry32(hashSeed(k))() * 2 - 1) * r).toFixed(2);

	// their own screenshots, labelled by what the exercise was
	const LABELS: Record<string, string> = {
		bohemian: 'bohemian rhapsody',
		print: 'fit to print',
		clocks: 'the clocks',
		final: 'their site'
	};
	const groups = [
		['bohemian', manifest.bohemian, bohemianIndex],
		['print', manifest.print, printIndex],
		['clocks', manifest.clocks, clockIndex],
		['final', manifest.final, finalIndex]
	] as const;
	const made = groups.flatMap(([key, entries, index]) => {
		const imgs = studentWork(student.slug, [
			[entries as { slug: string; url: string }[], index as Record<string, string>]
		]);
		return imgs.map((img) => ({ img, label: LABELS[key] }));
	});
</script>

<PosterFrame {orientation} accent="blue" folio="contributor" grainSeed={student.slug}>
	<div class="poster" class:land>
		<header class="head">
			<p class="kicker font-hand">a contributor to web2026</p>
			<h1 class="name">
				<RansomLine text={student.name.toLowerCase()} size={land ? '3.4rem' : '4rem'} />
			</h1>
		</header>

		<div class="work">
			{#each made as m, i (m.img)}
				<figure class="tile" style="--tilt: {tilt(m.img, 4)}deg">
					<Tape
						color={i % 2 ? 'blue' : 'pink'}
						tilt="{tilt(m.img + 't', 8)}deg"
						seedKey={m.img}
						style="left: 22%; top: -0.8rem"
					/>
					<img src={m.img} alt="" />
					<figcaption class="font-hand">{m.label}</figcaption>
				</figure>
			{/each}
		</div>

		<footer class="foot-row">
			{#if quote}
				<blockquote class="pull">
					<span class="mk">“</span>{quote.text}”
					<cite class="font-hand">— day {quote.day}</cite>
				</blockquote>
			{/if}
			<div class="qr">
				<div class="qrbox">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html qr}
				</div>
				<p class="qrcap font-hand">
					see their work<br /><span class="url">{url.replace('https://', '')}</span>
				</p>
			</div>
		</footer>
	</div>
</PosterFrame>

<style>
	.poster {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: calc(var(--leading) * 1.1);
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.kicker {
		font-size: 1.3rem;
		color: var(--color-pink);
		transform: rotate(-1.2deg);
	}
	.name {
		margin-top: 0.1rem;
	}

	/* their work: the hero. fills the middle of the sheet */
	.work {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 1.6rem 1.5rem;
		align-content: stretch;
		overflow: hidden;
	}
	.tile {
		position: relative;
		margin: 0;
		background: #fffcf4;
		padding: 0.55rem 0.55rem 0.45rem;
		transform: rotate(var(--tilt));
		box-shadow: 0 3px 13px rgba(50, 24, 113, 0.17);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.tile img {
		display: block;
		width: 100%;
		flex: 1;
		min-height: 0;
		object-fit: cover;
		outline: 1px solid rgba(50, 24, 113, 0.12);
	}
	.tile figcaption {
		padding-top: 0.4rem;
		font-size: 1rem;
		color: var(--color-pink);
	}
	/* a lone or odd-last screenshot spans full width so the grid never gaps */
	.work .tile:only-child,
	.work .tile:last-child:nth-child(odd) {
		grid-column: 1 / -1;
	}

	.foot-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
	}
	.pull {
		margin: 0;
		font-size: 1.4rem;
		line-height: 1.35;
		font-weight: 600;
		color: var(--color-violet);
		max-width: 24ch;
		text-wrap: balance;
	}
	.pull .mk {
		color: var(--color-pink);
	}
	.pull cite {
		display: block;
		margin-top: 0.3rem;
		font-style: normal;
		font-size: 0.9rem;
		color: var(--color-pink);
	}
	.qr {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		flex-shrink: 0;
	}
	.qrbox {
		width: 34mm;
		height: 34mm;
		padding: 3mm;
		background: #fffcf4;
		box-shadow: 0 2px 8px rgba(50, 24, 113, 0.16);
	}
	.qrbox :global(svg) {
		display: block;
	}
	.qrcap {
		font-size: 1rem;
		color: var(--color-blue);
		line-height: 1.3;
	}
	.url {
		color: var(--color-pink);
		font-size: 0.82rem;
	}

	/* landscape: name + quote + QR on the left, the work grid on the right */
	.land {
		display: grid;
		grid-template-columns: 0.8fr 1.2fr;
		grid-template-rows: auto 1fr;
		gap: 1.4rem 2.4rem;
	}
	.land .head {
		grid-column: 1;
	}
	.land .work {
		grid-column: 2;
		grid-row: 1 / 3;
	}
	.land .foot-row {
		grid-column: 1;
		grid-row: 2;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 1.5rem;
	}
</style>
