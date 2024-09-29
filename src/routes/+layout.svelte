<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { setViewerState, getViewerState } from '$lib/viewer-state.svelte';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { Menu, Info, SlidersHorizontal, Moon, Sun, HelpCircle, Github } from 'lucide-svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Rail } from '$lib/components/rail';
	import { Information } from '$lib/components/information';
	import { Layers } from '$lib/components/layers';
	import { Dimensions } from '$lib/components/dimensions';
	import { Adjustments } from '$lib/components/adjustments';

	import '../app.css';

	let { children }: { children: Snippet } = $props();

	setViewerState();
	const viewerState = getViewerState();

	let innerWidth = $state(0);
	let isToolbarVisible = $state(true);

	$effect(() => {
		if (innerWidth < 1024) {
			isToolbarVisible = false;
		} else {
			isToolbarVisible = true;
		}
	});

	const tiles = $derived([
		{
			name: 'Toggle toolbar',
			icon: Menu,
			onClick: (): void => {
				isToolbarVisible = !isToolbarVisible;
			}
		},
		{
			name: 'Information',
			icon: Info,
			onClick: (): void => {
				isToolbarVisible = true;
				viewerState.activeTile = 'Information';
			}
		},
		{
			name: 'Settings',
			icon: SlidersHorizontal,
			onClick: (): void => {
				isToolbarVisible = true;
				viewerState.activeTile = 'Settings';
			},
			isDisabled: viewerState.views.length === 0
		},
		{ name: 'Toggle theme', icon: Sun, class: 'mt-auto dark:hidden', onClick: toggleMode },
		{ name: 'Toggle theme', icon: Moon, class: 'mt-auto hidden dark:block', onClick: toggleMode },
		{ name: 'Help', icon: HelpCircle, isDisabled: true },
		{ name: 'GitHub link', icon: Github, href: 'https://github.com/igoresso/mr-velous' }
	]);
</script>

<svelte:window bind:innerWidth />

<ModeWatcher track={false} defaultMode={'dark'} />
<Toaster expand={true} richColors />

<div class="flex h-full">
	<Rail {tiles} activeTile={isToolbarVisible && viewerState.activeTile} />

	{#if isToolbarVisible}
		<div
			class="shrink-0 border-r-2"
			transition:slide={{ duration: 500, easing: quintOut, axis: 'x' }}
		>
			<div class="flex h-full w-72 flex-col">
				<header class="border-b-2 p-3">
					<h1 class="text-center text-xl font-bold">MR.VELOUS</h1>
				</header>

				<aside class="flex grow flex-col space-y-5 px-5 py-3">
					{#if viewerState.activeTile === 'Information'}
						<Information />
					{:else if viewerState.activeTile === 'Settings'}
						<Layers />
						<Dimensions />
						<Adjustments />
					{/if}
				</aside>
			</div>
		</div>
	{/if}

	<main class="grow">
		{@render children()}
	</main>
</div>
