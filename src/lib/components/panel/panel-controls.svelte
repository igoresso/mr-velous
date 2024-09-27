<svelte:options runes={true} />

<script lang="ts">
	import { Axis3D, Locate, Move, Fullscreen, Plus, Ellipsis } from 'lucide-svelte';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { getPanelState } from './panel-state.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import * as Select from '$lib/components/ui/select';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Toggle } from '$lib/components/ui/toggle';
	import { Button } from '$lib/components/ui/button';
	import type { View } from '$lib/types';
	import type { Mode } from './index';

	type Props = {
		view: View;
		width: number;
	};

	let { view, width }: Props = $props();

	const viewerState = getViewerState();
	const panelState = getPanelState();

	const axes = new Map([
		[1, { value: 1, label: 'Axis 1' }],
		[2, { value: 2, label: 'Axis 2' }],
		[3, { value: 3, label: 'Axis 3' }]
	]);

	function handleModeChange(value: string | undefined) {
		if (value) {
			panelState.setActiveMode(value as Mode);
		}
	}

	function handleAxisChange(value: number | undefined) {
		if (value) {
			viewerState.swapViews(view.axis, value);
		}
	}

	$inspect({ axes, view, panelState, viewerState });
</script>

{#if width > 384}
	<Select.Root
		selected={axes.get(view.axis)}
		onSelectedChange={(s) => s && handleAxisChange(s.value)}
	>
		<Select.Trigger class="mr-auto w-32" aria-label="Select axis">
			<Axis3D class="mr-2 h-5 w-5" />
			<Select.Value placeholder="Axis" />
		</Select.Trigger>
		<Select.Content>
			{#each axes.values() as axis}
				<Select.Item value={axis.value} label={axis.label}>{axis.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<ToggleGroup.Root type="single" value={panelState.activeMode} onValueChange={handleModeChange}>
		<ToggleGroup.Item value="cursor" aria-label="Toggle cursor">
			<Locate class="h-5 w-5" />
		</ToggleGroup.Item>
		<ToggleGroup.Item value="zoom" aria-label="Toggle zoom/move">
			<Move class="h-5 w-5" />
		</ToggleGroup.Item>
	</ToggleGroup.Root>

	<Separator orientation="vertical" />

	<div class="flex space-x-1">
		<Toggle
			aria-label="Toggle crosshair"
			pressed={panelState.crosshair}
			onPressedChange={() => panelState.toggleCrosshair()}
		>
			<Plus class="h-5 w-5" />
		</Toggle>

		<Button
			variant="ghost"
			class="px-3"
			onclick={() => viewerState.resetTransform(view.axis)}
			aria-label="Reset view"
		>
			<Fullscreen class="h-5 w-5" />
		</Button>
	</div>
{:else}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost"><Ellipsis /></Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Select axis</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					{#each axes.values() as axis}
						<DropdownMenu.CheckboxItem
							checked={view.axis === axis.value}
							onCheckedChange={() => handleAxisChange(axis.value)}
							>{axis.label}</DropdownMenu.CheckboxItem
						>
					{/each}
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Separator />
			<DropdownMenu.Label>Controls</DropdownMenu.Label>
			<DropdownMenu.RadioGroup value={panelState.activeMode} onValueChange={handleModeChange}>
				<DropdownMenu.RadioItem value="cursor">Cursor</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="zoom">Move / zoom</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
			<DropdownMenu.Separator />
			<DropdownMenu.Label>Visuals</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Item onclick={() => panelState.toggleCrosshair()}>
					<Plus class="mr-2 h-4 w-4" />
					Toggle crosshair
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => viewerState.resetTransform(view.axis)}>
					<Fullscreen class="mr-2 h-4 w-4" />
					Reset view
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
