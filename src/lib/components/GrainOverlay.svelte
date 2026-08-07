<!-- Paper grain over the whole issue: one feTurbulence tile multiplied on top of
     everything. Sits fixed so it reads as the sheet, not the content. -->
<div class="grain" aria-hidden="true"></div>

<style>
	.grain {
		position: fixed;
		inset: 0;
		z-index: 50;
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0.55;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.85 0 0 0 0 0.83 0 0 0 0 0.79 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
		background-size: 240px 240px;
	}
</style>
