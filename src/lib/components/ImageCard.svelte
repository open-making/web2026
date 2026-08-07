<script>
	export let project;
</script>

<a
	href={project.url}
	target="_blank"
	rel="noopener noreferrer"
	class="image-card group relative block"
>
	<div class="image-container relative aspect-[4/3] overflow-hidden">
		<div class="image-bg h-full w-full" style="--bg-image: url('{project.imageSrc}');"></div>
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		></div>
	</div>
	<div class="space-y-2 px-2 py-4">
		<div class="flex items-start justify-between gap-2">
			<span class="text-xs whitespace-nowrap text-muted-foreground">
				{new Date(project.createdAt).toLocaleDateString()}
			</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="font-body text-sm text-muted-foreground">by</span>
			<span class="font-body text-sm font-medium text-foreground">{project.author}</span>
		</div>
	</div>
</a>

<style>
	.image-container {
		box-shadow:
			rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
			rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
		border-radius: 4px;
		border: 1px solid black;
	}

	.image-bg {
		background-image: var(--bg-image);
		background-size: cover;
		background-position: center top;
		background-repeat: no-repeat;
	}

	.image-card:hover .image-bg {
		animation: scrollDown var(--scroll-duration, 10s) infinite ease-in-out;
		animation-delay: 0s;
		animation-fill-mode: forwards;
	}

	@keyframes scrollDown {
		0% {
			background-position: center top;
		}
		50% {
			background-position: center bottom;
		}
		100% {
			background-position: center top;
		}
	}
</style>
