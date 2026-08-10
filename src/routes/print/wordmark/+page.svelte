<script lang="ts">
	// The bare wordmark: "web2026 / showcase" as two stacked ransom lines, the
	// same masthead the cover carries, but with nothing behind it. The exporter
	// screenshots `.wordmark` with omitBackground so the ground stays transparent;
	// the padding keeps each scrap's tear-shadow from clipping at the edge.
	import RansomLine from '$lib/components/RansomLine.svelte';
</script>

<div class="wordmark">
	<RansomLine text="web2026" size="4.6rem" />
	<RansomLine text="showcase" size="4.6rem" />
</div>

<style>
	.wordmark {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.18em;
		/* room for the drop-shadow + rotated scraps so nothing crops in the capture */
		padding: 0.6em 0.9em;
	}
</style>
