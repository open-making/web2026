<script lang="ts">
	// index tabs pinned to the edge of the zine, like the section dividers in a
	// day-planner. they double as a reading indicator: the tab for whatever
	// section sits at the middle of the viewport lights up, the ones behind you
	// read as "already turned past". the whole rail fades in once the cover has
	// scrolled away, so the top of the page stays clean.
	import { onMount } from 'svelte';
	import { sections } from '$lib/data/section-titles';

	const items = [
		{ id: 'sites', ink: 'blue', ...sections.sites },
		{ id: 'season', ink: 'pink', ...sections.notes },
		{ id: 'archive', ink: 'violet', ...sections.archive },
		{ id: 'columns', ink: 'blue', ...sections.columns },
		{ id: 'contributors', ink: 'pink', ...sections.contributors },
		{ id: 'awards', ink: 'violet', ...sections.awards }
	];

	let active = $state('');
	let shown = $state(false);
	const activeIndex = $derived(items.findIndex((i) => i.id === active));

	onMount(() => {
		const targets = items
			.map((i) => document.getElementById(i.id))
			.filter((el): el is HTMLElement => el !== null);

		// a section is "current" while it straddles the middle band of the viewport
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) active = e.target.id;
			},
			{ rootMargin: '-45% 0px -45% 0px', threshold: 0 }
		);
		targets.forEach((t) => io.observe(t));

		// hold the rail back until the reader is past the cover
		const cover = document.getElementById('cover');
		const coverIO = cover
			? new IntersectionObserver(([e]) => (shown = !e.isIntersecting), { threshold: 0.12 })
			: undefined;
		coverIO?.observe(cover!);
		if (!cover) shown = true;

		return () => {
			io.disconnect();
			coverIO?.disconnect();
		};
	});
</script>

<nav class="rail" class:shown aria-label="Sections">
	<ul>
		{#each items as it, i (it.id)}
			<li>
				<a
					class="tab"
					class:active={active === it.id}
					class:passed={activeIndex > -1 && i < activeIndex}
					href="#{it.id}"
					style="--ink: var(--color-{it.ink})"
					aria-current={active === it.id ? 'location' : undefined}
				>
					<span class="label font-hand">{it.tag}</span>
					<span class="nub" aria-hidden="true"></span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.rail {
		position: fixed;
		top: 50%;
		right: 0;
		z-index: 50;
		transform: translateY(-50%) translateX(0.6rem);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
	}
	.rail.shown {
		opacity: 1;
		transform: translateY(-50%) translateX(0);
		pointer-events: auto;
	}

	ul {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.55rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tab {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		text-decoration: none;
	}

	/* the tab sticking out of the bound edge */
	.nub {
		display: block;
		width: 21px;
		height: 26px;
		border-radius: 7px 0 0 7px;
		background: var(--ink);
		opacity: 0.32;
		box-shadow: 0 1px 2px rgba(50, 24, 113, 0.18);
		transition:
			width 0.22s cubic-bezier(0.34, 1.4, 0.64, 1),
			height 0.22s ease,
			opacity 0.22s ease;
	}
	/* sections already scrolled past sit a touch heavier than the ones ahead */
	.tab.passed .nub {
		opacity: 0.6;
	}
	.tab:hover .nub {
		width: 24px;
		opacity: 0.85;
	}
	.tab.active .nub {
		width: 32px;
		height: 40px;
		opacity: 1;
		box-shadow:
			0 1px 2px rgba(50, 24, 113, 0.22),
			0 4px 10px rgba(50, 24, 113, 0.16);
	}

	.label {
		font-size: 0.82rem;
		line-height: 1;
		white-space: nowrap;
		color: var(--ink);
		background: #fffcf4;
		padding: 0.34em 0.6em;
		border-radius: 3px;
		box-shadow:
			0 1px 2px rgba(50, 24, 113, 0.16),
			0 4px 10px rgba(50, 24, 113, 0.12);
		opacity: 0;
		transform: translateX(0.4rem);
		transition:
			opacity 0.22s ease,
			transform 0.22s ease;
	}
	.tab.active .label,
	.tab:hover .label,
	.tab:focus-visible .label {
		opacity: 1;
		transform: translateX(0);
	}
	.tab:focus-visible {
		outline: none;
	}
	.tab:focus-visible .nub {
		outline: 2px solid var(--color-pink);
		outline-offset: 2px;
	}

	/* phone: keep the tappable spine, drop the labels so nothing overlaps text.
	   the current tab still reads clearly by being taller and full-strength. */
	@media (max-width: 40rem) {
		.rail {
			top: auto;
			bottom: 1.1rem;
			transform: translateX(0.6rem);
		}
		.rail.shown {
			transform: translateX(0);
		}
		ul {
			gap: 0;
		}
		.label {
			display: none;
		}
		/* the nub stays a small mark, but the whole tab is a ~48px touch target:
		   transparent padding around it, neighbours flush so there are no dead gaps */
		.tab {
			gap: 0;
			padding: 0.65rem 0.35rem 0.65rem 2rem;
		}
		.nub {
			width: 12px;
			height: 24px;
		}
		.tab.active .nub {
			width: 16px;
			height: 34px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rail,
		.nub,
		.label {
			transition: opacity 0.2s ease;
		}
	}
</style>
