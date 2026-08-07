<script lang="ts">
	// A screenshot pasted into the zine at full color, like a photo print:
	// thin ink keyline, faint lift on hover when it links out.
	let {
		src,
		alt,
		href = undefined
	}: { src: string; alt: string; href?: string | undefined } = $props();
</script>

{#if href}
	<a {href} class="print">
		<img {src} {alt} loading="lazy" />
	</a>
{:else}
	<span class="print">
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
