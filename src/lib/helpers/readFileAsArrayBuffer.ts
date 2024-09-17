export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(reader.result as ArrayBuffer);
		reader.onerror = () => reject(new Error('Failed to read file'));

		reader.readAsArrayBuffer(file);
	});
}
