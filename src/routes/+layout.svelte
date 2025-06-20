<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import PanelLeftOpenIcon from '@lucide/svelte/icons/panel-left-open';
	import PanelLeftCloseIcon from '@lucide/svelte/icons/panel-left-close';
	import InfoIcon from '@lucide/svelte/icons/info';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import HelpCircleIcon from '@lucide/svelte/icons/help-circle';
	import GithubIcon from '@lucide/svelte/icons/github';
	import { setViewerState } from '$lib/context/viewer.svelte';
	import { setDialogState } from '$lib/context/dialog.svelte';
	import { setLoaderState } from '$lib/context/loader.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { Dialog, DialogContent } from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Rail } from '$lib/components/custom/rail';
	import { About } from '$lib/components/custom/about';
	import { Information } from '$lib/components/custom/information';
	import { Layers } from '$lib/components/custom/layers';
	import { Dimensions } from '$lib/components/custom/dimensions';
	import { Adjustments } from '$lib/components/custom/adjustments';

	import '../app.pcss';

	let { children }: { children: Snippet } = $props();

	const viewer = setViewerState();

	const dialog = setDialogState();

	setLoaderState(viewer);

	let innerWidth = $state(0);
	let isSidebarVisible = $state(false);

	$effect.pre(() => {
		isSidebarVisible = innerWidth >= 1024;
	});

	const tiles = $derived([
		{
			name: 'Open sidebar',
			icon: PanelLeftOpenIcon,
			class: isSidebarVisible ? 'hidden' : '',
			onClick: (): void => {
				isSidebarVisible = !isSidebarVisible;
			}
		},
		{
			name: 'Close sidebar',
			icon: PanelLeftCloseIcon,
			class: isSidebarVisible ? '' : 'hidden',
			onClick: (): void => {
				isSidebarVisible = !isSidebarVisible;
			}
		},
		{
			name: 'Information',
			icon: InfoIcon,
			onClick: (): void => {
				isSidebarVisible = true;
				viewer.activeTile = 'Information';
			}
		},
		{
			name: 'Settings',
			icon: SlidersHorizontalIcon,
			onClick: (): void => {
				isSidebarVisible = true;
				viewer.activeTile = 'Settings';
			},
			isDisabled: viewer.views.length === 0
		},
		{ name: 'Toggle theme', icon: SunIcon, class: 'mt-auto dark:hidden', onClick: toggleMode },
		{
			name: 'Toggle theme',
			icon: MoonIcon,
			class: 'mt-auto hidden dark:block',
			onClick: toggleMode
		},
		{
			name: 'About',
			icon: HelpCircleIcon,
			isDialog: true,
			onClick: (): void => {
				dialog.openDialog(About);
			}
		},
		{ name: 'GitHub link', icon: GithubIcon, href: 'https://github.com/igoresso/mr-velous' }
	]);
</script>

<svelte:window bind:innerWidth />

<ModeWatcher />

<Toaster expand={true} richColors />

<TooltipProvider>
	{#if innerWidth > 0}
		<div class="flex h-full">
			<Rail {tiles} activeTile={isSidebarVisible ? viewer.activeTile : null} />

			{#if isSidebarVisible}
				<div
					class="shrink-0 border-r-2"
					transition:slide={{ duration: 500, easing: quintOut, axis: 'x' }}
				>
					<div class="flex h-full min-h-0 w-72 flex-col">
						<header class="border-b-2 p-3">
							<h1 class="text-center text-xl font-bold">MR.VELOUS</h1>
						</header>

						<ScrollArea class="flex-1 overflow-hidden" orientation="vertical">
							<aside class="flex h-full flex-col gap-5 px-5 py-3">
								{#if viewer.activeTile === 'Information'}
									<Information />
								{:else if viewer.activeTile === 'Settings'}
									<Adjustments />
									<Dimensions />
									<Layers />
								{/if}
							</aside>
						</ScrollArea>
					</div>
				</div>
			{/if}

			<main class="relative min-w-80 flex-1">
				{@render children()}
			</main>
		</div>
	{/if}
</TooltipProvider>

<Dialog bind:open={dialog.isOpen}>
	<DialogContent>
		{#if dialog.content}
			<dialog.content />
		{/if}
	</DialogContent>
</Dialog>
