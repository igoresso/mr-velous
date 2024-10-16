import type { Icon } from 'lucide-svelte';

export type Tile = {
	name: string;
	icon: typeof Icon;
	class?: string;
	href?: string;
	onClick?: () => void;
	isDisabled?: boolean;
};

export { default as Rail } from './rail.svelte';
