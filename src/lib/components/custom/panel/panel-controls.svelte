<svelte:options runes={true} />

<script lang="ts">
	import { Axis3D, Locate, Move, Fullscreen, Plus, Ellipsis, Compass } from 'lucide-svelte';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { getPanelState } from './panel-state.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Select from '$lib/components/ui/select';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Tooltip from '$lib/components/ui/tooltip';
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
		[0, { value: 0, label: 'Axis 1' }],
		[1, { value: 1, label: 'Axis 2' }],
		[2, { value: 2, label: 'Axis 3' }]
	]);

	function handleModeChange(value: string | string[] | undefined) {
		if (Array.isArray(value)) {
			value = value[0];
		}

		if (value) {
			panelState.setActiveMode(value as Mode);
		}
	}

	function handleAxisChange(value: number | undefined) {
		if (value !== undefined) {
			viewerState.swapViews(view.axis, value);
		}
	}
</script>

{#if width > 400}
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
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<span use:builder.action {...builder}>
					<ToggleGroup.Item value="cursor" aria-label="Toggle cursor">
						<Locate class="h-5 w-5" />
					</ToggleGroup.Item>
				</span>
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Cursor</span>
			</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<span use:builder.action {...builder}>
					<ToggleGroup.Item value="zoom" aria-label="Toggle move/zoom">
						<Move class="h-5 w-5" />
					</ToggleGroup.Item>
				</span>
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Move/zoom</span>
			</Tooltip.Content>
		</Tooltip.Root>
	</ToggleGroup.Root>

	<Separator orientation="vertical" />

	<div class="flex space-x-1">
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<span use:builder.action {...builder}>
					<Toggle
						aria-label="Toggle crosshair"
						pressed={panelState.crosshair}
						onPressedChange={() => panelState.toggleCrosshair()}
					>
						<Plus class="h-5 w-5" />
					</Toggle>
				</span>
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Toggle crosshair</span>
			</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<span use:builder.action {...builder}>
					<Toggle
						aria-label="Toggle directions"
						pressed={panelState.directions}
						onPressedChange={() => panelState.toggleDirections()}
					>
						<Compass class="h-5 w-5" />
					</Toggle>
				</span>
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Toggle directions</span>
			</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					variant="ghost"
					class="px-3"
					onclick={() => viewerState.resetTransform(view.axis)}
					aria-label="Reset view"
				>
					<Fullscreen class="h-5 w-5" />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Reset view</span>
			</Tooltip.Content>
		</Tooltip.Root>
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
				<DropdownMenu.Item onclick={() => panelState.toggleDirections()}>
					<Compass class="mr-2 h-4 w-4" />
					Toggle directions
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => viewerState.resetTransform(view.axis)}>
					<Fullscreen class="mr-2 h-4 w-4" />
					Reset view
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
