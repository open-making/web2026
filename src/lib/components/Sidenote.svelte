<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	
	export let id: string;
	export let note: string;
	
	let isMobile = false;
	let isExpanded = false;
	let noteNumber = 1;
	
	const dispatch = createEventDispatcher();
	
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		// Generate note number based on position in document
		const allSidenotes = document.querySelectorAll('[data-sidenote]');
		noteNumber = Array.from(allSidenotes).indexOf(document.querySelector(`[data-sidenote="${id}"]`)) + 1;
		
		return () => window.removeEventListener('resize', checkMobile);
	});
	
	function toggleNote() {
		if (isMobile) {
			isExpanded = !isExpanded;
		}
	}
</script>

<span class="sidenote-wrapper" data-sidenote={id}>
	<span class="sidenote-content">
		<slot />
		<button 
			class="sidenote-ref" 
			class:mobile={isMobile}
			on:click={toggleNote}
			aria-label={`Show sidenote ${noteNumber}`}
		>
			{noteNumber}
		</button>
	</span>
	
	{#if !isMobile}
		<aside class="sidenote" aria-label={`Sidenote ${noteNumber}`}>
			<span class="sidenote-number">{noteNumber}</span>
			{note}
		</aside>
	{:else if isExpanded}
		<div class="mobile-sidenote" transition:slide={{ duration: 200 }}>
			<span class="sidenote-number">{noteNumber}</span>
			{note}
		</div>
	{/if}
</span>

<style>
	.sidenote-wrapper {
		position: relative;
		display: inline;
	}
	
	.sidenote-content {
		position: relative;
		background: linear-gradient(120deg, #a8e6cf 0%, #ffd3a5 100%);
		padding: 1px 2px;
		border-radius: 2px;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}
	
	.sidenote-ref {
		background: none;
		border: none;
		color: #6366f1;
		font-size: 0.75rem;
		font-weight: 600;
		vertical-align: super;
		line-height: 0;
		margin-left: 1px;
		cursor: pointer;
		padding: 0;
		text-decoration: none;
	}
	
	.sidenote-ref:hover {
		color: #4338ca;
		text-decoration: underline;
	}
	
	.sidenote-ref.mobile {
		cursor: pointer;
		padding: 2px 4px;
		background: #6366f1;
		color: white;
		border-radius: 50%;
		margin-left: 3px;
	}
	
	.sidenote {
		position: absolute;
		left: calc(100% + 2rem);
		top: -0.5rem;
		width: 250px;
		font-size: 0.85rem;
		line-height: 1.4;
		color: #64748b;
		background: white;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}
	
	.sidenote-number {
		font-weight: 600;
		color: #6366f1;
		margin-right: 0.25rem;
	}
	
	.mobile-sidenote {
		display: block;
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.85rem;
		line-height: 1.4;
		color: #64748b;
	}
	
	/* Responsive positioning for desktop */
	@media (min-width: 768px) {
		.sidenote-wrapper {
			/* No margin needed - sidenote floats outside content area */
		}
	}
	
	/* Ensure text flows properly on mobile */
	@media (max-width: 767px) {
		.sidenote-wrapper {
			display: inline;
		}
		
		.sidenote-content {
			display: inline;
		}
	}
</style>