<script lang="ts">
	// A cut line between zine pages: crop marks at the corners, the folio in the middle.
	let { page, title = 'the web2026 bulletin' }: { page: string; title?: string } = $props();
</script>

<div class="cut" role="separator">
	<svg class="marks" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 0v8M0 12h8" stroke="currentColor" stroke-width="1.5" fill="none" />
	</svg>
	<span class="folio">p. {page} · {title}</span>
	<svg class="marks" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 24v-8M24 12h-8" stroke="currentColor" stroke-width="1.5" fill="none" />
	</svg>
</div>

<style>
	.cut {
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: var(--page-max);
		margin: calc(var(--leading) * 2) auto;
		padding-inline: 1.25rem;
		color: var(--color-blue);
	}
	.cut::before,
	.cut::after {
		content: '';
		flex: 1;
		border-top: 1px dashed currentColor;
		opacity: 0.5;
	}
	.marks {
		width: 1rem;
		height: 1rem;
		opacity: 0.6;
	}
	.folio {
		font-family: var(--font-hand);
		font-size: 0.8rem;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
</style>
