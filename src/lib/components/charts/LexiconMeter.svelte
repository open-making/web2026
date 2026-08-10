<script lang="ts">
	// A tug-of-war between the two lexicons the notes reached for: the struggle
	// words on one side, the relief words on the other. Counts are real; the bar
	// splits at their ratio and the words underneath show what fed each side.
	type Word = { word: string; n: number };
	let {
		frustration,
		triumph,
		frustrationWords = [],
		triumphWords = []
	}: {
		frustration: number;
		triumph: number;
		frustrationWords?: Word[];
		triumphWords?: Word[];
	} = $props();

	const total = $derived(frustration + triumph || 1);
	const fPct = $derived((frustration / total) * 100);
</script>

<div class="lex">
	<div
		class="bar"
		role="img"
		aria-label="{frustration} words of struggle versus {triumph} words of relief in the notes"
	>
		<div class="side frust" style="flex-basis: {fPct}%">
			<span class="n font-body">{frustration}</span>
		</div>
		<div class="side triumph" style="flex-basis: {100 - fPct}%">
			<span class="n font-body">{triumph}</span>
		</div>
	</div>

	<div class="cols font-hand">
		<ul class="frust-list">
			{#each frustrationWords as w (w.word)}
				<li><span class="w">{w.word}</span><span class="c">{w.n}</span></li>
			{/each}
		</ul>
		<ul class="triumph-list">
			{#each triumphWords as w (w.word)}
				<li><span class="c">{w.n}</span><span class="w">{w.word}</span></li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.lex {
		width: 100%;
	}
	.bar {
		display: flex;
		height: 1.7rem;
		border-radius: 3px;
		overflow: hidden;
	}
	.side {
		display: flex;
		align-items: center;
		mix-blend-mode: multiply;
		min-width: 2.2rem;
	}
	.frust {
		background: var(--color-violet);
		justify-content: flex-end;
	}
	.triumph {
		background: var(--color-pink);
		justify-content: flex-start;
	}
	.n {
		color: var(--color-paper);
		font-size: 0.85rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		padding: 0 0.55rem;
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem 2rem;
		margin-top: 0.7rem;
		font-size: 0.95rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	li {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}
	.frust-list li {
		color: var(--color-violet);
	}
	.triumph-list li {
		color: var(--color-pink);
	}
	.w {
		flex: 1;
	}
	.triumph-list .w {
		text-align: right;
	}
	.c {
		font-variant-numeric: tabular-nums;
		opacity: 0.7;
		font-size: 0.85rem;
	}
</style>
