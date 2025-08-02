import type { Component } from 'svelte';

export type Tile = {
	name: string;
	icon: Component;
	class?: string;
	href?: string;
	onClick?: () => void;
	isDisabled?: boolean;
	isDialog?: boolean;
};

export { default as Rail } from './rail.svelte';
