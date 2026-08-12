<script lang="ts">
	// A screenshot pasted into the zine at full color, like a photo print:
	// thin ink keyline, faint lift on hover when it links out.
	let {
		src,
		alt,
		href = undefined,
		// when set (e.g. "4 / 3"), the image is cropped to a fixed box so a row of
		// tiles stays uniform regardless of each screenshot's native aspect, with
		// object-fit: cover anchored to center bottom.
		ratio = undefined
	}: { src: string; alt: string; href?: string | undefined; ratio?: string | undefined } =
		$props();
</script>

{#if href}
	<a {href} class="print" class:cover={ratio} style={ratio ? `--ratio: ${ratio}` : undefined}>
		<img {src} {alt} loading="lazy" />
	</a>
{:else}
	<span class="print" class:cover={ratio} style={ratio ? `--ratio: ${ratio}` : undefined}>
		<img {src} {alt} loading="lazy" />
	</span>
{/if}

<style>
	.print {
		display: block;
		line-height: 0;
		overflow: hidden;
		outline: 1px solid rgba(50, 24, 113, 0.14);
	}
	img {
		width: 100%;
		height: auto;
		transition: transform 0.3s ease;
	}
	/* uniform tiles: fix the box to --ratio and crop the screenshot into it */
	.cover {
		aspect-ratio: var(--ratio);
	}
	.cover img {
		height: 100%;
		object-fit: cover;
		object-position: center bottom;
	}
	a.print:hover img,
	a.print:focus-visible img {
		transform: scale(1.025);
	}
	@media (prefers-reduced-motion: reduce) {
		img {
			transition: none;
		}
	}
</style>
