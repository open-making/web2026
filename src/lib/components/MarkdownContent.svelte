<script lang="ts">
	import { marked } from 'marked';
	import { afterUpdate } from 'svelte';

	export let content: string;

	let containerElement: HTMLDivElement;

	function openImageInNewTab(src: string) {
		window.open(src, '_blank');
	}

	$: htmlContent = marked.parse(content);

	afterUpdate(() => {
		if (containerElement) {
			// Find all images and make them clickable
			const images = containerElement.querySelectorAll('img');
			images.forEach(img => {
				img.style.cursor = 'pointer';
				img.addEventListener('click', () => {
					const src = img.src;
					openImageInNewTab(src);
				});
			});
		}
	});
</script>

<div
	bind:this={containerElement}
	class="prose prose-sm max-w-none"
	style="font-family: 'Atkinson Hyperlegible', sans-serif;"
>
	{@html htmlContent}
</div>

