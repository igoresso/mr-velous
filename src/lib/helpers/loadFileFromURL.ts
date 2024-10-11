export async function loadFileFromURL(url: string): Promise<Blob> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);

	try {
		const response = await fetch(url, { signal: controller.signal });

		clearTimeout(timeout);

		if (!response.ok) {
			throw new Error(`Network error: ${response.statusText}`);
		}

		return await response.blob();
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Request timed out');
		}
		throw error;
	} finally {
		clearTimeout(timeout);
	}
}
