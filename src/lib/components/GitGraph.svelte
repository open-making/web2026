<script lang="ts">
	export let commits: any[] = [];

	// Process commits to create a chronological list
	$: processedCommits = commits.sort(
		(a, b) => new Date(b.date || b.time).getTime() - new Date(a.date || a.time).getTime()
	);

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Generate colors for different repositories using CSS custom properties
	const repoColors = [
		'var(--color-blue)',
		'var(--color-purple)',
		'var(--color-green)',
		'var(--color-orange)',
		'var(--color-red)',
		'var(--color-sage)',
		'var(--color-yellow)'
	];

	function getRepoColor(repoName: string, index: number) {
		const hash = repoName.split('').reduce((a, b) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);
		return repoColors[Math.abs(hash) % repoColors.length];
	}
</script>

<div class="git-graph-container">
	<div class="overflow-hidden rounded-xl border-2 border-black bg-white">
		<div class="border-b-2 border-black bg-gray-50 p-6">
			<h3
				class="text-2xl font-bold text-gray-800"
				style="font-family: 'LibreCaslonCondensed', serif;"
			>
				{processedCommits.length} git commits
			</h3>
		</div>

		<div class="max-h-96 overflow-y-auto">
			<table class="w-full table-fixed border-separate border-spacing-0">
				<thead>
					<tr>
						<th class="w-[30px]"></th>
						<!-- Git tree column -->
						<th class="w-auto"></th>
						<!-- Content column -->
						<th class="w-[120px]"></th>
						<!-- Date column -->
					</tr>
				</thead>
				<tbody>
					{#each processedCommits as commit, index}
						{@const color = getRepoColor(commit.repository, index)}
						<tr class="relative h-14 transition-colors hover:bg-gray-50">
							<td class="border-s-2 border-solid" style="border-left-color: {color};">
								<div
									class="circle-component circle-upper-left border bg-white"
									style="border-color: {color}; background-color: {color};"
								></div>
							</td>
							<td class="px-4 py-3">
								<div class="flex flex-col gap-1">
									<p
										class="line-clamp-2 text-sm font-medium text-gray-800"
										style="font-family: 'Atkinson Hyperlegible', sans-serif;"
									>
										{commit.message}
									</p>
									<div class="flex items-center gap-2 text-xs text-gray-500">
										<span
											class="rounded px-2 py-1 font-mono text-white"
											style="background-color: {color};"
										>
											{commit.repository}
										</span>
										
									</div>
								</div>
							</td>
							<td class="px-4 py-3 text-right">
								<span
									class="text-xs text-gray-500"
									style="font-family: 'Atkinson Hyperlegible', sans-serif;"
								>
									{formatDate(commit.date || commit.time)}
								</span>
							</td>
						</tr>
					{/each}

					{#if processedCommits.length === 0}
						<tr class="h-20">
							<td colspan="3" class="py-8 text-center">
								<p class="text-gray-500" style="font-family: 'Atkinson Hyperlegible', sans-serif;">
									No commits found
								</p>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	/* Styled after the GitLens commit graph */
	.circle-component {
		position: absolute;
		z-index: 40;
		height: 1.2rem;
		width: 1.2rem;
		border-radius: 9999px;
		border-width: 2px;
	}

	.circle-upper-left {
		top: 0px;
		transform: translate(-12px, -5px);
	}

	.git-graph-container {
		width: 100%;
	}

	/* Line clamp utility */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
