<script lang="ts">
	import Cover from '$lib/sections/Cover.svelte';
	import Toc from '$lib/sections/Toc.svelte';
	import Season from '$lib/sections/Season.svelte';
	import SevenSites from '$lib/sections/SevenSites.svelte';
	import Archive from '$lib/sections/Archive.svelte';
	import Columns from '$lib/sections/Columns.svelte';
	import Contributors from '$lib/sections/Contributors.svelte';
	import BackCover from '$lib/sections/BackCover.svelte';
	import PageBreak from '$lib/components/PageBreak.svelte';
</script>

<svelte:head>
	<title>the web2026 zine</title>
	<meta
		name="description"
		content="Seven students, 25 days, one small web. The showcase issue of Introduction to Making for the Web, 2026."
	/>
</svelte:head>

<Cover />
<PageBreak page="2" />
<Toc />
<PageBreak page="3" />
<SevenSites />
<PageBreak page="4" />
<Season />
<PageBreak page="5" />
<Archive />
<PageBreak page="6" />
<Columns />
<PageBreak page="7" />
<Contributors />
<PageBreak page="8" />
<BackCover />
