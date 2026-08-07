<script lang="ts">
	import { goto } from '$app/navigation';
	import { Menu } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Drawer from '$lib/components/ui/drawer';
	import { MediaQuery } from 'svelte/reactivity';

	const isDesktop = new MediaQuery('min-width: 800px');
	let drawerOpen = false;

	// TOC sections with their corresponding IDs
	const sections = [
		{ id: 'hey-jude', title: 'Hey Jude', subtitle: 'Making ugly sites' },
		{ id: 'short-stories', title: 'Short Stories', subtitle: 'CSS layouts' },
		{ id: 'digital-gardens', title: 'Digital Gardens', subtitle: 'Personal sites' },
		{ id: 'meet-the-devs', title: 'Meet the Devs', subtitle: 'Student profiles' }
	];

	function scrollToSection(sectionId: string) {
		goto(`#${sectionId}`, { replaceState: false });
		drawerOpen = false; // Close drawer on mobile after clicking
	}
</script>

{#if !isDesktop.current}
	<!-- Mobile drawer -->
	<Drawer.Root bind:open={drawerOpen}>
		<Drawer.Trigger>
			<Button
				size="sm"
				variant="outline"
				class="fixed right-6 bottom-6 z-50 h-12 w-12 rounded-sm border border-black bg-white p-0 shadow-lg hover:bg-black hover:text-white"
			>
				<Menu class="h-5 w-5" />
			</Button>
		</Drawer.Trigger>
		<Drawer.Content class="max-h-[60vh]">
			<div class="px-4 py-8">
				<div class="grid grid-cols-2 gap-3">
					{#each sections as section}
						<button
							on:click={() => scrollToSection(section.id)}
							class="group flex flex-col items-center justify-center rounded-lg border-2 border-black bg-white p-4 text-center transition-colors hover:bg-black hover:text-white"
						>
							<span class="text-sm font-semibold">{section.title}</span>
							<span class="mt-1 text-xs opacity-70">{section.subtitle}</span>
						</button>
					{/each}
				</div>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<!-- Desktop floating TOC -->
	<div class="fixed top-1/2 left-2 z-50 -translate-y-1/2 transform">
		<div class="rounded-xs border bg-white p-3">
			<nav class="space-y-2">
				{#each sections as section}
					<button
						on:click={() => scrollToSection(section.id)}
						class="group block w-full rounded px-3 py-2 text-left text-xs transition-colors hover:bg-black hover:text-white"
					>
						<div class="font-semibold">{section.title}</div>
						<div class="mt-0.5 text-[10px] opacity-70">{section.subtitle}</div>
					</button>
				{/each}
			</nav>
		</div>
	</div>
{/if}
