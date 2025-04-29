/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
		await self.skipWaiting();
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);

			if (cachedResponse) {
				return cachedResponse;
			}
		}

		try {
			const response = await fetch(event.request);
			const isNotExtension = url.protocol === 'http:' || url.protocol === 'https:';
			const isSuccessful = response.status === 200;

			if (!(response instanceof Response)) {
				throw new Error('Invalid response from fetch');
			}

			if (isNotExtension && isSuccessful) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const cachedResponse = await cache.match(url.pathname);

			if (cachedResponse) {
				return cachedResponse;
			}

			throw err;
		}
	}

	event.respondWith(respond());
});
