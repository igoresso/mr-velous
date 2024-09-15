<script lang="ts">
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Menu, Info, SlidersHorizontal, Moon, Sun, HelpCircle, Github } from 'lucide-svelte';
	import { Rail } from '$lib/components/rail';

	import type { Snippet } from 'svelte';

	import '../app.css';

	let { children }: { children: Snippet } = $props();

	let innerWidth = $state(0);
	let activeTile = $state('Information');
	let isToolbarVisible = $state(true);

	$effect(() => {
		if (innerWidth < 1024) {
			isToolbarVisible = false;
		} else {
			isToolbarVisible = true;
		}
	});

	let tiles = [
		{ name: 'Toggle toolbar', icon: Menu, onClick: () => (isToolbarVisible = !isToolbarVisible) },
		{ name: 'Information', icon: Info, onClick: () => (activeTile = 'Information') },
		{
			name: 'Settings',
			icon: SlidersHorizontal,
			onClick: () => (activeTile = 'Settings'),
			isDisabled: true
		},
		{ name: 'Toggle theme', icon: Sun, class: 'mt-auto dark:hidden', onClick: toggleMode },
		{ name: 'Toggle theme', icon: Moon, class: 'mt-auto hidden dark:block', onClick: toggleMode },
		{ name: 'Help', icon: HelpCircle, isDisabled: true },
		{ name: 'GitHub link', icon: Github, href: '' }
	];
</script>

<svelte:window bind:innerWidth />

<ModeWatcher track={false} defaultMode={'dark'} />
<Toaster expand={true} richColors />

{#if innerWidth > 0}
	<div class="flex h-full">
		<Rail {tiles} {activeTile} />

		<div class="w-72 border-r-2" class:hidden={!isToolbarVisible}>
			<header class="border-b-2 p-2.5">
				<h1 class="text-center text-2xl font-bold">MR.VELOUS</h1>
			</header>

			<aside class="px-5 py-3">
				<h2 class="text-lg font-semibold">{activeTile}</h2>
			</aside>
		</div>

		<main class="grow p-5">
			{@render children()}
		</main>
	</div>
{/if}
