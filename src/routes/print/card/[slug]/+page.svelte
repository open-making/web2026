<script lang="ts">
	// A 3.5×2in single-sided business card, one per contributor. Same paper, grain
	// and inks as the posters, shrunk to a pocket. The exporter screenshots `.card`
	// at 300 DPI (1050×600). Name in ransom across the top, then the live showcase
	// URL beside a QR that opens their page.
	import RansomLine from '$lib/components/RansomLine.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	let { data } = $props();
	const { student, url, qr } = data;
	// split the URL so the printed line breaks ONLY at a slash (never mid-word) and
	// the student's own segment reads as the accent — the QR carries the real link.
	const bare = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
	const cut = bare.lastIndexOf('/');
	const base = bare.slice(0, cut + 1); // e.g. teaching.aman.bh/web2026/showcase/
	const slug = bare.slice(cut + 1); // e.g. rushikesh
	// a zero-width break opportunity after each slash — the only place it may wrap
	const baseBroken = base.replace(/\//g, '/​');

	// offset the grain tooth per card so no two share the exact texture
	const gr = mulberry32(hashSeed(student.slug));
	const grainPos = `${Math.floor(gr() * 180)}px ${Math.floor(gr() * 180)}px`;
</script>

<div class="card">
	<div class="grain" aria-hidden="true" style="background-position: {grainPos}"></div>

	<div class="body">
		<h1 class="name">
			<RansomLine text={student.name.toLowerCase()} size="1.7rem" />
		</h1>

		<div class="row">
			<p class="url font-hand">
				<!-- zero-width break after every slash: the only place a line may wrap -->
				<span class="base">{baseBroken}</span><span class="slug">{slug}</span>
			</p>
			<div class="qrbox">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html qr}
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		position: relative;
		box-sizing: border-box;
		width: 88.9mm; /* 3.5in */
		height: 50.8mm; /* 2in */
		flex-shrink: 0;
		overflow: hidden;
		background: var(--color-paper);
		color: var(--color-blue);
		box-shadow: 0 6px 22px rgba(50, 24, 113, 0.22);
	}

	.grain {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0.45;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0 0.28 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
		background-size: 180px 180px;
	}

	.body {
		position: relative;
		z-index: 2;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 6mm 7mm;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 3mm;
	}

	.name {
		margin: 0;
	}
	/* the name is a single scrap line — never let it wrap onto a second row */
	.name :global(.line) {
		flex-wrap: nowrap;
		white-space: nowrap;
		justify-content: flex-start;
	}

	.row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 4mm;
		min-height: 0;
	}
	.url {
		font-size: 0.86rem;
		line-height: 1.32;
		/* only the injected zero-width spaces are break points — never mid-word */
		word-break: normal;
		overflow-wrap: normal;
		max-width: 48mm;
	}
	/* the shared path sits on its own line(s); the student's slug always drops to
	   a fresh line beneath it */
	.url .base {
		display: block;
		color: var(--color-blue);
	}
	.url .slug {
		color: var(--color-pink);
		white-space: nowrap;
	}

	.qrbox {
		flex-shrink: 0;
		width: 24mm;
		height: 24mm;
		padding: 1.8mm;
		background: #fffcf4;
		box-shadow: 0 2px 8px rgba(50, 24, 113, 0.16);
	}
	.qrbox :global(svg) {
		display: block;
	}
</style>
