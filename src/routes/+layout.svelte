<script lang="ts">
	import '../app.css';
	import GrainOverlay from '$lib/components/GrainOverlay.svelte';
	import { SHARE, SITE_URL } from '$lib/data/collateral';
	let { children } = $props();
	// favicon <link> tags live in app.html so they carry the base-path prefix
</script>

<svelte:head>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="web2026 showcase" />
	<meta property="og:title" content={SHARE.title} />
	<meta property="og:description" content={SHARE.description} />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={SHARE.image} />
	<meta property="og:image:width" content={String(SHARE.imageWidth)} />
	<meta property="og:image:height" content={String(SHARE.imageHeight)} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={SHARE.title} />
	<meta name="twitter:description" content={SHARE.description} />
	<meta name="twitter:image" content={SHARE.image} />
</svelte:head>

{@render children?.()}

<GrainOverlay />
