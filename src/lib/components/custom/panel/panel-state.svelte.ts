import { getContext, setContext } from 'svelte';
import type { Mode, Cursor } from './index';

const modeToCursor = new Map<Mode, Cursor>([
	['cursor', 'cursor-crosshair'],
	['zoom', 'cursor-move']
]);

export class PanelState {
	activeMode = $state<Mode>('cursor');
	crosshair = $state(true);
	directions = $state(true);
	cursor = $derived(modeToCursor.get(this.activeMode));

	toggleCrosshair(): void {
		this.crosshair = !this.crosshair;
	}

	toggleDirections(): void {
		this.directions = !this.directions;
	}

	setActiveMode(mode: string): void {
		if (!modeToCursor.has(mode as Mode)) {
			return;
		}
		this.activeMode = mode as Mode;
	}
}

const PANEL_KEY = Symbol('PANEL');

export function setPanelState() {
	return setContext(PANEL_KEY, new PanelState());
}

export function getPanelState() {
	return getContext<ReturnType<typeof setPanelState>>(PANEL_KEY);
}
