<script lang="ts">
	// A full-bleed collage sheet, no text at all. `cover` packs the whole
	// showcase (every note attachment + every deployed screenshot, the same pool
	// the site cover draws from); the other keys pack a single exercise's
	// screenshots. Tiles are pasted with tape + a deterministic tilt so a repeated
	// image reads as a wall, not a duplicate. The exporter screenshots `.sheet`.
	import Tape from '$lib/components/Tape.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';
	import { byFile } from '$lib/utils/images';
	import manifest from '../../../../../content/screenshots.json';
	import notesIndex from '$lib/assets/images/notes/index.json';
	import finalIndex from '$lib/assets/images/final/index.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';

	let { data } = $props();
	const land = data.orientation === 'landscape';

	const INDEX = {
		final: finalIndex,
		bohemian: bohemianIndex,
		print: printIndex,
		clocks: clockIndex
	} as const;

	// resolve one exercise group's screenshots to their processed webp srcs
	function groupPool(key: keyof typeof INDEX): string[] {
		const index = INDEX[key];
		const out: string[] = [];
		for (const e of manifest[key]) {
			const file = index[e.url as keyof typeof index] as string | undefined;
			const src = file ? byFile(file) : undefined;
			if (src) out.push(src);
		}
		return out;
	}

	// the cover wall: every note attachment + every deployed screenshot
	function coverPool(): string[] {
		const out: string[] = [];
		for (const meta of Object.values(notesIndex) as { file: string }[]) {
			const src = byFile(meta.file);
			if (src) out.push(src);
		}
		for (const key of Object.keys(INDEX) as (keyof typeof INDEX)[]) out.push(...groupPool(key));
		return out;
	}

	const pool = data.key === 'cover' ? coverPool() : groupPool(data.key as keyof typeof INDEX);

	// grid geometry: the cover is a dense wall; a single exercise gets fewer,
	// bigger tiles so the work is actually legible while still filling the sheet.
	const grid =
		data.key === 'cover'
			? land
				? { cols: 6, rows: 4 }
				: { cols: 5, rows: 6 }
			: land
				? { cols: 3, rows: 3 }
				: { cols: 2, rows: 4 };

	// deterministic per (key, orientation) so exports are reproducible
	const rand = mulberry32(hashSeed(`${data.key}:${data.orientation}`));
	const shuffled = [...pool]
		.map((p) => ({ p, k: rand() }))
		.sort((a, b) => a.k - b.k)
		.map((x) => x.p);

	const tiles = Array.from({ length: grid.cols * grid.rows }, (_, i) => ({
		src: shuffled[i % shuffled.length],
		tilt: (rand() * 2 - 1) * 5,
		tape: ['pink', 'blue', 'paper'][Math.floor(rand() * 3)] as 'pink' | 'blue' | 'paper',
		seed: `cl-${data.key}-${i}`
	}));
</script>

<div
	class="sheet {data.orientation}"
	data-orientation={data.orientation}
	style="--cols: {grid.cols}; --rows: {grid.rows}"
>
	<div class="collage" aria-hidden="true">
		{#each tiles as tile (tile.seed)}
			<div class="paste" style="--tilt: {tile.tilt.toFixed(1)}deg">
				<Tape
					color={tile.tape}
					tilt="{(-tile.tilt * 1.3).toFixed(1)}deg"
					seedKey={tile.seed}
					style="left: 28%; top: -0.7rem"
				/>
				<img src={tile.src} alt="" />
			</div>
		{/each}
	</div>
</div>

<style>
	.sheet {
		position: relative;
		box-sizing: border-box;
		flex-shrink: 0;
		background: var(--color-paper);
		overflow: hidden;
		box-shadow: 0 8px 30px rgba(50, 24, 113, 0.25);
	}
	.portrait {
		width: 210mm;
		height: 297mm;
	}
	.landscape {
		width: 297mm;
		height: 210mm;
	}

	/* pack the sheet edge to edge — the whole page should be collage */
	.collage {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		gap: 4mm;
		padding: 5mm;
	}
	.paste {
		position: relative;
		min-height: 0;
		background: #fffcf4;
		padding: 2mm 2mm 3mm;
		transform: rotate(var(--tilt));
		box-shadow: 0 2px 9px rgba(50, 24, 113, 0.16);
	}
	.paste img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		outline: 1px solid rgba(50, 24, 113, 0.1);
	}

	@media print {
		.sheet {
			box-shadow: none;
		}
	}
</style>
