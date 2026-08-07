<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import Sticker from '$lib/components/Sticker.svelte';
	import studentDatabase from '$lib/data/student-database.json';
	import stats from '$lib/data/season-stats.json';
	import notesIndex from '$lib/assets/images/notes/index.json';
	import manifest from '../../content/screenshots.json';
	import finalIndex from '$lib/assets/images/final/index.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';
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

	// the pool: every image the students attached to a dev note, plus every
	// screenshot of their deployed work
	type Piece = { src: string; href: string };
	const pool: Piece[] = [];
	for (const meta of Object.values(notesIndex) as {
		file: string;
		slug: string;
	}[]) {
		const src = byFile(meta.file);
		if (src) pool.push({ src, href: `${base}/${meta.slug}` });
	}
	const groups: [keyof typeof manifest, Record<string, string>, string][] = [
		['final', finalIndex, '#sites'],
		['bohemian', bohemianIndex, '#archive'],
		['print', printIndex, '#archive'],
		['clocks', clockIndex, '#archive']
	];
	for (const [group, index, href] of groups) {
		for (const e of manifest[group]) {
			const file = index[e.url];
			const src = file ? byFile(file) : undefined;
			if (src) pool.push({ src, href });
		}
	}

	// pack a wall: grid slots across the whole hero with jitter and overlap.
	// SSR gets a seeded arrangement; every visit reshuffles on mount.
	type Slot = Piece & {
		left: number;
		top: number;
		w: number;
		tilt: number;
		z: number;
		tape: string;
		tapeSeed: string;
	};
	const COLS = 7;
	const ROWS = 4;
	function arrange(rand: () => number): Slot[] {
		const shuffled = [...pool]
			.map((p) => ({ p, k: rand() }))
			.sort((a, b) => a.k - b.k)
			.map(({ p }) => p);
		const slots: Slot[] = [];
		let i = 0;
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const piece = shuffled[i % shuffled.length];
				i++;
				slots.push({
					...piece,
					left: (c / COLS) * 103 - 3 + rand() * 5,
					// top row may run off the top edge; the bottom row always
					// lands fully inside the hero
					top: -3 + (r / ROWS) * 88 + rand() * 5,
					w: 8.5 + rand() * 4,
					tilt: (rand() * 2 - 1) * 9,
					z: Math.floor(rand() * 3),
					tape: ['pink', 'blue', 'paper'][Math.floor(rand() * 3)],
					tapeSeed: `cover-${r}-${c}-${Math.floor(rand() * 999)}`
				});
			}
		}
		return slots;
	}

	let slots = $state(arrange(mulberry32(20260812)));
	onMount(() => {
		slots = arrange(Math.random);
	});
</script>

<section id="cover" class="cover">
	<div class="collage" aria-hidden="true">
		{#each slots as s (s.tapeSeed + s.src)}
			<a
				href={s.href}
				class="paste"
				tabindex="-1"
				style="left: {s.left}%; top: {s.top}%; width: {s.w}rem; --tilt: {s.tilt.toFixed(
					1
				)}deg; z-index: {s.z}"
			>
				<Tape
					color={s.tape as 'pink' | 'blue' | 'paper'}
					tilt="{(-s.tilt * 1.4).toFixed(1)}deg"
					seedKey={s.tapeSeed}
					style="left: 30%; top: -0.7rem"
				/>
				<img src={s.src} alt="" loading="eager" />
			</a>
		{/each}
	</div>

	<div class="matter">
		<p class="edition font-hand">19 july – 12 august 2026 · mdes @ daiict</p>
		<h1 class="masthead">
			<RansomLine text="the web2026" />
			<RansomLine text="zine" />
		</h1>
		<p class="byline">ft. {names.join(', ')}</p>

		<Sticker
			seedKey="cover-notes"
			tilt="-8deg"
			style="position: absolute; left: -9rem; bottom: -1.5rem">{t.notes} dev notes inside</Sticker
		>
		<Sticker
			color="blue"
			seedKey="cover-words"
			tilt="5deg"
			style="position: absolute; right: -8.5rem; top: -1rem"
			>{t.words.toLocaleString()} words</Sticker
		>
	</div>
</section>

<style>
	.cover {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 94svh;
		padding: calc(var(--leading) * 2) 1.25rem;
		text-align: center;
		overflow: hidden;
	}

	/* ── the pasted wall ── */
	.collage {
		position: absolute;
		inset: 0;
	}
	.paste {
		position: absolute;
		display: block;
		padding: 0.4rem 0.4rem 0.5rem;
		background: #fffcf4;
		transform: rotate(var(--tilt));
		box-shadow:
			0 1px 2px rgba(50, 24, 113, 0.16),
			0 6px 16px rgba(50, 24, 113, 0.14);
		transition: transform 0.25s ease;
	}
	.paste:hover {
		transform: rotate(var(--tilt)) scale(1.05);
		z-index: 11 !important;
	}
	.paste img {
		width: 100%;
		height: auto;
		max-height: 9.5rem;
		object-fit: cover;
		display: block;
		outline: 1px solid rgba(50, 24, 113, 0.12);
	}

	/* ── the matter on top ── */
	.matter {
		position: relative;
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--leading);
	}
	.edition,
	.byline {
		background: #fffcf4;
		box-shadow:
			0 1px 2px rgba(50, 24, 113, 0.16),
			0 4px 10px rgba(50, 24, 113, 0.1);
		padding: 0.3em 0.8em;
	}
	.edition {
		font-size: 1rem;
		letter-spacing: 0.03em;
		color: var(--color-pink);
		transform: rotate(-1.2deg);
	}
	.masthead {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		align-items: center;
	}
	.byline {
		font-size: 1rem;
		max-width: 36rem;
		text-wrap: balance;
		transform: rotate(0.8deg);
	}

	/* smaller screens: fewer pieces, stickers inline */
	@media (max-width: 64rem) {
		.cover {
			min-height: 92svh;
		}
		.paste:nth-child(n + 17) {
			display: none;
		}
		.matter :global(.sticker) {
			position: static !important;
			margin-top: 0.5rem;
		}
	}
</style>
