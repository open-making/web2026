<script lang="ts">
	import Icon from '@iconify/svelte';

	export let website: string | null = null;
	export let socialLinks: string[] = [];
	export let username: string;

	// Function to detect social media platform from URL and return appropriate icon
	function getSocialInfo(url: string) {
		const domain = new URL(url).hostname.toLowerCase();

		if (domain.includes('github.com')) {
			return { icon: 'mdi:github', name: 'GitHub', color: 'var(--color-neutral)' };
		} else if (domain.includes('twitter.com') || domain.includes('x.com')) {
			return { icon: 'mdi:twitter', name: 'Twitter', color: 'var(--color-blue)' };
		} else if (domain.includes('linkedin.com')) {
			return { icon: 'mdi:linkedin', name: 'LinkedIn', color: 'var(--color-blue)' };
		} else if (domain.includes('instagram.com')) {
			return { icon: 'mdi:instagram', name: 'Instagram', color: 'var(--color-red)' };
		} else if (domain.includes('behance.net')) {
			return { icon: 'mdi:behance', name: 'Behance', color: 'var(--color-blue)' };
		} else if (domain.includes('dribbble.com')) {
			return { icon: 'mdi:basketball', name: 'Dribbble', color: 'var(--color-red)' };
		} else if (domain.includes('youtube.com')) {
			return { icon: 'mdi:youtube', name: 'YouTube', color: 'var(--color-red)' };
		} else if (domain.includes('codepen.io')) {
			return { icon: 'mdi:codepen', name: 'CodePen', color: 'var(--color-neutral)' };
		} else if (domain.includes('figma.com')) {
			return { icon: 'mdi:figma', name: 'Figma', color: 'var(--color-purple)' };
		} else if (domain.includes('medium.com')) {
			return { icon: 'mdi:medium', name: 'Medium', color: 'var(--color-neutral)' };
		} else if (domain.includes('dev.to')) {
			return { icon: 'mdi:dev-to', name: 'Dev.to', color: 'var(--color-neutral)' };
		} else if (domain.includes('stackoverflow.com')) {
			return { icon: 'mdi:stack-overflow', name: 'Stack Overflow', color: 'var(--color-orange)' };
		} else {
			return { icon: 'mdi:web', name: 'Website', color: 'var(--color-sage)' };
		}
	}

	function getWebsiteInfo(url: string) {
		try {
			const domain = new URL(url).hostname.toLowerCase();
			return { icon: 'mdi:web', name: domain, color: 'var(--color-sage)' };
		} catch {
			return { icon: 'mdi:web', name: 'Website', color: 'var(--color-sage)' };
		}
	}

	// Generate GitHub URL and check if it's already in social links
	$: githubUrl = `https://github.com/${username}`;
	$: hasGithubLink = socialLinks.some(link => link.toLowerCase().includes('github.com'));
	$: shouldShowGithubLink = username && !hasGithubLink;
</script>

<div class="flex flex-wrap gap-3">
	<!-- Default GitHub link -->
	{#if shouldShowGithubLink}
		<a
			href={githubUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			style="font-family: 'Atkinson Hyperlegible', sans-serif;"
			title="GitHub"
		>
			<Icon icon="mdi:github" width="16" height="16" style="color: var(--color-neutral);" />
			<span>GitHub</span>
		</a>
	{/if}

	{#if website}
		{@const info = getWebsiteInfo(website)}
		<a
			href={website}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			style="font-family: 'Atkinson Hyperlegible', sans-serif;"
		>
			<Icon icon={info.icon} width="16" height="16" style="color: {info.color};" />
			<span>{info.name}</span>
		</a>
	{/if}

	{#each socialLinks as link}
		{@const info = getSocialInfo(link)}
		<a
			href={link}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			style="font-family: 'Atkinson Hyperlegible', sans-serif;"
			title={info.name}
		>
			<Icon icon={info.icon} width="16" height="16" style="color: {info.color};" />
			<span>{info.name}</span>
		</a>
	{/each}
</div>