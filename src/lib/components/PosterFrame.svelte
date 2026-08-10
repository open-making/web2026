<script lang="ts">
	// One A4 sheet. All poster geometry lives here so every collateral piece is
	// the exact same paper. The Playwright exporter screenshots `.sheet` for the
	// 300-DPI PNG and sizes page.pdf() to match these mm, so this element IS the
	// print. Content stays inside `.safe` (a generous margin, no bleed).
	import type { Snippet } from 'svelte';
	import { mulberry32, hashSeed } from './prng';

	let {
		orientation = 'portrait',
		accent = 'blue',
		folio = '',
		grainSeed = 'poster',
		children
	}: {
		orientation?: 'portrait' | 'landscape';
		/** ink for the folio + corner marks */
		accent?: 'pink' | 'blue' | 'violet';
		/** series line printed along the foot, e.g. "personal sites" */
		folio?: string;
		grainSeed?: string;
		children?: Snippet;
	} = $props();

	const INK = { pink: '#ff48b0', blue: '#3255a4', violet: '#321871' };

	// offset the grain tile per poster so no two sheets share the exact tooth
	const gr = mulberry32(hashSeed(grainSeed));
	const grainPos = `${Math.floor(gr() * 180)}px ${Math.floor(gr() * 180)}px`;
</script>

<div class="sheet {orientation}" data-orientation={orientation} style="--ink: {INK[accent]}">
	<!-- paper grain, painted inside the sheet so it prints as tooth not film -->
	<div class="grain" aria-hidden="true" style="background-position: {grainPos}"></div>

	<!-- corner registration marks, the zine's crop-mark motif -->
	{#each ['tl', 'tr', 'bl', 'br'] as corner (corner)}
		<svg class="mark {corner}" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 0v9M0 12h9" fill="none" stroke="var(--ink)" stroke-width="1.5" />
		</svg>
	{/each}

	<div class="safe">
		{@render children?.()}
	</div>

	<div class="foot">
		<span class="folio">web2026 showcase</span>
		{#if folio}<span class="folio tag">— {folio}</span>{/if}
		<span class="rule"></span>
		<span class="folio">mdes @ daiict</span>
	</div>
</div>

<style>
	.sheet {
		position: relative;
		box-sizing: border-box;
		/* the stage is a flex row; without this the sheet shrinks to fit the
		   viewport and the exported PNG comes out narrow */
		flex-shrink: 0;
		background: var(--color-paper);
		color: var(--color-blue);
		overflow: hidden;
		/* a faint contact shadow only helps the on-screen preview; print media
		   drops it so the PDF page is clean */
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

	.grain {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0.5;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0 0.28 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
		background-size: 180px 180px;
	}

	.mark {
		position: absolute;
		width: 8mm;
		height: 8mm;
		opacity: 0.55;
		z-index: 3;
	}
	.tl {
		top: 9mm;
		left: 9mm;
	}
	.tr {
		top: 9mm;
		right: 9mm;
		transform: rotate(90deg);
	}
	.bl {
		bottom: 9mm;
		left: 9mm;
		transform: rotate(-90deg);
	}
	.br {
		bottom: 9mm;
		right: 9mm;
		transform: rotate(180deg);
	}

	.safe {
		position: relative;
		z-index: 2;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 22mm 20mm 26mm;
		display: flex;
		flex-direction: column;
	}

	.foot {
		position: absolute;
		z-index: 3;
		left: 20mm;
		right: 20mm;
		bottom: 13mm;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--ink);
	}
	.folio {
		font-family: var(--font-hand);
		font-size: 0.82rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.tag {
		color: var(--color-pink);
	}
	.rule {
		flex: 1;
		border-top: 1px dashed var(--ink);
		opacity: 0.45;
	}

	@media print {
		.sheet {
			box-shadow: none;
		}
	}
</style>
