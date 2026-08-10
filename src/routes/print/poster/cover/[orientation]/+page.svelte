<script lang="ts">
	import PosterFrame from '$lib/components/PosterFrame.svelte';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import studentDatabase from '$lib/data/student-database.json';
	import notesIndex from '$lib/assets/images/notes/index.json';
	import manifest from '../../../../../content/screenshots.json';
	import finalIndex from '$lib/assets/images/final/index.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';
	import { mulberry32 } from '$lib/components/prng';
	import { byFile } from '$lib/utils/images';
	import { qrSvg } from '$lib/utils/qr';
	import { SITE_URL } from '$lib/data/collateral';

	let { data } = $props();
	const land = data.orientation === 'landscape';

	const names = Object.values(studentDatabase.students)
		.map((s) => s.name)
		.sort((a, b) => a.localeCompare(b));

	const qr = qrSvg(SITE_URL, { ink: 'violet' });

	// the same pool the site cover builds from: every note attachment + every
	// deployed screenshot. we fill the whole sheet with it.
	const pool: string[] = [];
	for (const meta of Object.values(notesIndex) as { file: string }[]) {
		const src = byFile(meta.file);
		if (src) pool.push(src);
	}
	const groups: [keyof typeof manifest, Record<string, string>][] = [
		['final', finalIndex],
		['bohemian', bohemianIndex],
		['print', printIndex],
		['clocks', clockIndex]
	];
	for (const [group, index] of groups) {
		for (const e of manifest[group]) {
			const file = index[e.url];
			const src = file ? byFile(file) : undefined;
			if (src) pool.push(src);
		}
	}

	// a dense, deterministic grid that packs the entire sheet — the page should
	// feel full. seeded so exports are reproducible (no onMount reshuffle).
	const rand = mulberry32(land ? 20260813 : 20260812);
	const shuffled = [...pool]
		.map((p) => ({ p, k: rand() }))
		.sort((a, b) => a.k - b.k)
		.map((x) => x.p);
	const cols = land ? 6 : 5;
	const rows = land ? 4 : 6;
	const tiles = Array.from({ length: cols * rows }, (_, i) => ({
		src: shuffled[i % shuffled.length],
		tilt: (rand() * 2 - 1) * 6,
		tape: ['pink', 'blue', 'paper'][Math.floor(rand() * 3)] as 'pink' | 'blue' | 'paper',
		seed: `cv-${i}`
	}));
</script>

<PosterFrame orientation={data.orientation} accent="pink" folio="" grainSeed="cover">
	<div class="cover" class:land style="--cols: {cols}">
		<!-- the wall, edge to edge behind everything -->
		<div class="collage" aria-hidden="true">
			{#each tiles as tile (tile.seed)}
				<div class="paste" style="--tilt: {tile.tilt.toFixed(1)}deg">
					<Tape
						color={tile.tape}
						tilt="{(-tile.tilt * 1.3).toFixed(1)}deg"
						seedKey={tile.seed}
						style="left: 26%; top: -0.65rem"
					/>
					<img src={tile.src} alt="" />
				</div>
			{/each}
		</div>

		<!-- the paper shows through in the middle so the masthead + QR read; a
		     soft gradient, not a hard white box -->
		<div class="veil" aria-hidden="true"></div>

		<div class="matter">
			<p class="edition font-hand">mdes @ daiict · a showcase</p>
			<h1 class="masthead">
				<RansomLine text="web2026" size={land ? '3.4rem' : '4rem'} />
				<RansomLine text="showcase" size={land ? '3.4rem' : '4rem'} />
			</h1>

			<div class="qr">
				<div class="qrbox">
					<Tape color="blue" tilt="-6deg" seedKey="cover-qr" style="left: 24%; top: -0.85rem" />
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html qr}
				</div>
				<p class="scan font-hand">scan to explore the work</p>
			</div>

			<p class="byline">{names.join(' · ')}</p>
		</div>
	</div>
</PosterFrame>

<style>
	.cover {
		position: relative;
		height: 100%;
		margin: -22mm -20mm -26mm; /* bleed the collage past the safe area */
	}

	.collage {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: 4mm;
		padding: 6mm;
		align-content: stretch;
	}
	.paste {
		position: relative;
		background: #fffcf4;
		padding: 2mm 2mm 3mm;
		transform: rotate(var(--tilt));
		box-shadow: 0 2px 9px rgba(50, 24, 113, 0.16);
	}
	.paste img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 30mm;
		object-fit: cover;
		outline: 1px solid rgba(50, 24, 113, 0.1);
	}

	.veil {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 68% 58% at 50% 48%,
			var(--color-paper) 0%,
			var(--color-paper) 30%,
			rgba(250, 247, 239, 0.92) 55%,
			rgba(250, 247, 239, 0) 82%
		);
	}

	.matter {
		position: absolute;
		inset: 0;
		z-index: 4;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: calc(var(--leading) * 1.15);
		text-align: center;
		padding: 24mm;
	}
	.edition {
		font-size: 1.35rem;
		color: var(--color-pink);
		letter-spacing: 0.02em;
		transform: rotate(-1.2deg);
	}
	.masthead {
		display: flex;
		flex-direction: column;
		gap: 0.22em;
		align-items: center;
	}

	.qr {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
	}
	.qrbox {
		position: relative;
		width: 46mm;
		height: 46mm;
		padding: 4.5mm;
		background: #fffcf4;
		box-shadow: 0 3px 12px rgba(50, 24, 113, 0.2);
	}
	.qrbox :global(svg) {
		display: block;
	}
	.scan {
		font-size: 1.25rem;
		color: var(--color-blue);
	}
	.byline {
		font-size: 1.15rem;
		color: var(--color-violet);
		max-width: 32ch;
		text-wrap: balance;
		font-weight: 600;
	}

	/* landscape: masthead + QR side by side so the short sheet still fills */
	.land .matter {
		flex-direction: row;
		justify-content: center;
		gap: 4rem;
		flex-wrap: wrap;
	}
	.land .edition {
		flex-basis: 100%;
	}
	.land .byline {
		flex-basis: 100%;
	}
</style>
