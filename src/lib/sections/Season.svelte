<script lang="ts">
	import TimeOfDay from '$lib/components/charts/TimeOfDay.svelte';
	import NoteLengths from '$lib/components/charts/NoteLengths.svelte';
	import stats from '$lib/data/season-stats.json';

	const t = stats.totals;
</script>

<section id="season" class="page">
	<h2 class="font-display text-2xl font-bold misreg">the season</h2>

	<p class="lede">
		Between 19 July and 12 August, {t.students} students wrote {t.notes} dev notes, {t.words.toLocaleString()}
		words in all. The longest single note ran {t.longestNote.words} words
		<a href={t.longestNote.commentUrl}>(Darshan, day {t.longestNote.day})</a>.
	</p>

	<div class="charts">
		<figure class="chart">
			<h3 class="font-hand">when the notes got written</h3>
			<TimeOfDay
				hours={stats.hoursIST}
				annotation="{t.afterMidnight} of {t.notes} notes were posted after midnight"
			/>
		</figure>

		<figure class="chart">
			<h3 class="font-hand">how long they ran</h3>
			<NoteLengths buckets={stats.lengthBuckets} />
		</figure>
	</div>
</section>

<style>
	.page {
		max-width: var(--page-max);
		margin-inline: auto;
		padding-inline: 1.25rem;
	}
	.lede {
		max-width: var(--measure);
		margin-top: var(--leading);
		font-size: 1.1rem;
		text-wrap: pretty;
	}
	.lede a {
		text-decoration: underline;
		text-decoration-color: var(--color-pink);
	}
	.charts {
		margin-top: calc(var(--leading) * 1.5);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		gap: calc(var(--leading) * 1.5) 3rem;
	}
	.chart h3 {
		font-size: 1.05rem;
		color: var(--color-blue);
		margin-bottom: var(--leading);
	}
</style>
