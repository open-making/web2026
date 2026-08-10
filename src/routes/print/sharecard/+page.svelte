<script lang="ts">
	// 1200×630 OG card. Not an A4 sheet, so it frames itself rather than using
	// PosterFrame. scripts/sharecard.js screenshots `.card` and writes it to
	// static/sharecard.jpg (referenced by the OG tags in the root layout).
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Sticker from '$lib/components/Sticker.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import studentDatabase from '$lib/data/student-database.json';
	import stats from '$lib/data/season-stats.json';
	import notesIndex from '$lib/assets/images/notes/index.json';
	import finalIndex from '$lib/assets/images/final/index.json';
	import { mulberry32 } from '$lib/components/prng';

	const names = Object.values(studentDatabase.students)
		.map((s) => s.name)
		.sort((a, b) => a.localeCompare(b));
	const t = stats.totals;

	const allImages = import.meta.glob('$lib/assets/images/**/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
	const byFile = (file: string) =>
		Object.entries(allImages).find(([p]) => p.endsWith(`/${file}`))?.[1];

	const pool: string[] = [];
	for (const meta of Object.values(finalIndex) as string[]) {
		const src = byFile(meta);
		if (src) pool.push(src);
	}
	for (const meta of Object.values(notesIndex) as { file: string }[]) {
		const src = byFile(meta.file);
		if (src) pool.push(src);
	}
	const rand = mulberry32(20260812);
	const tiles = [...pool]
		.map((p) => ({ p, k: rand() }))
		.sort((a, b) => a.k - b.k)
		.slice(0, 6)
		.map((x, i) => ({ src: x.p, tilt: (rand() * 2 - 1) * 6, seed: `sc-${i}` }));
</script>

<div class="card">
	<div class="grain" aria-hidden="true"></div>

	<div class="left">
		<p class="edition font-hand">mdes @ daiict</p>
		<h1 class="masthead">
			<RansomLine text="web2026" size="4.4rem" />
			<RansomLine text="showcase" size="4.4rem" />
		</h1>
		<p class="byline">ft. {names.join(', ')}</p>
		<div class="stickers">
			<Sticker seedKey="sc-notes" tilt="-7deg">{t.notes} dev notes</Sticker>
			<Sticker color="blue" seedKey="sc-sites" tilt="6deg">seven personal sites</Sticker>
		</div>
	</div>

	<div class="right" aria-hidden="true">
		{#each tiles as tile, i (tile.seed)}
			<div class="paste" style="--tilt: {tile.tilt.toFixed(1)}deg; z-index: {i}">
				<Tape
					color={i % 2 ? 'blue' : 'pink'}
					tilt="{(-tile.tilt * 1.3).toFixed(1)}deg"
					seedKey={tile.seed}
					style="left: 30%; top: -0.7rem"
				/>
				<img src={tile.src} alt="" />
			</div>
		{/each}
	</div>
</div>

<style>
	.card {
		position: relative;
		width: 1200px;
		height: 630px;
		overflow: hidden;
		background: var(--color-paper);
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		align-items: center;
	}
	.grain {
		position: absolute;
		inset: 0;
		z-index: 5;
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0.45;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0 0.28 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
		background-size: 180px 180px;
	}

	.left {
		position: relative;
		z-index: 3;
		padding: 54px 24px 54px 64px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.4rem;
	}
	.edition {
		font-size: 1.4rem;
		color: var(--color-pink);
		transform: rotate(-1.3deg);
	}
	.masthead {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		align-items: flex-start;
	}
	.byline {
		font-size: 1.35rem;
		color: var(--color-violet);
		max-width: 34ch;
	}
	.stickers {
		display: flex;
		gap: 2rem;
		margin-top: 0.4rem;
	}

	.right {
		position: relative;
		height: 100%;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		align-content: center;
		gap: 22px;
		padding: 40px 40px 40px 12px;
	}
	.paste {
		position: relative;
		background: #fffcf4;
		padding: 8px 8px 12px;
		transform: rotate(var(--tilt));
		box-shadow: 0 3px 12px rgba(50, 24, 113, 0.18);
	}
	.paste img {
		display: block;
		width: 100%;
		height: 120px;
		object-fit: cover;
		outline: 1px solid rgba(50, 24, 113, 0.12);
	}
</style>
