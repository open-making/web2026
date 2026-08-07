<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import GrainOverlay from '$lib/components/GrainOverlay.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Duotone print pass for every screenshot on the site: luminance remapped to
     violet (shadows) → pink (mids) → paper (highlights). Applied by
     HalftoneImage via filter: url(#riso-duotone). -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
	<filter id="riso-duotone" color-interpolation-filters="sRGB">
		<feColorMatrix
			type="matrix"
			values="0.2126 0.7152 0.0722 0 0
			        0.2126 0.7152 0.0722 0 0
			        0.2126 0.7152 0.0722 0 0
			        0 0 0 1 0"
		/>
		<feComponentTransfer>
			<feFuncR type="table" tableValues="0.196 1.0 0.980" />
			<feFuncG type="table" tableValues="0.094 0.282 0.969" />
			<feFuncB type="table" tableValues="0.443 0.690 0.937" />
		</feComponentTransfer>
	</filter>
</svg>

{@render children?.()}

<GrainOverlay />
