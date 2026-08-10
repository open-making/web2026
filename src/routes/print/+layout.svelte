<script lang="ts">
	// The print route group. Everything under /print is a fixed-size artwork
	// (A4 poster or a share card) captured headless, not a scrolling page.
	//
	// The root +layout.svelte paints two full-viewport grain layers over every
	// route — GrainOverlay's `.grain` and the `body::after` tooth in app.css.
	// Those read as "the sheet" on the website, but on a captured poster they'd
	// be a flat film across the whole page instead of texture inside the paper.
	// The :global rules below only exist while this layout is mounted (i.e. only
	// on /print/*), so they suppress that global grain without touching the site.
	// Each PosterFrame paints its own grain *inside* the sheet instead.
	let { children } = $props();
</script>

<div class="stage">
	{@render children?.()}
</div>

<style>
	/* posters are static artwork: kill every animation so a headless capture is
	   deterministic (the ransom scraps' rise animation otherwise leaves letters
	   mid-fade, or invisible, depending on when the screenshot lands) */
	:global(*),
	:global(*::before),
	:global(*::after) {
		animation: none !important;
		transition: none !important;
	}

	/* kill the site-wide grain while a print route is on screen */
	:global(.grain) {
		display: none !important;
	}
	:global(body::after) {
		content: none !important;
		display: none !important;
	}

	/* on screen, float the sheet on a muted backdrop so its A4 edge is visible */
	.stage {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
		padding: 2rem;
		background: #cfc9bd;
	}

	/* page.pdf() renders through print media: strip the backdrop and let the
	   sheet sit flush at the top-left so the PDF page boxes the artwork exactly */
	@media print {
		:global(html),
		:global(body) {
			margin: 0;
			padding: 0;
			background: var(--color-paper);
		}
		.stage {
			min-height: 0;
			padding: 0;
			background: none;
			display: block;
		}
	}
</style>
