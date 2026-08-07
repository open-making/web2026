<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import GrainOverlay from '$lib/components/GrainOverlay.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<GrainOverlay />
