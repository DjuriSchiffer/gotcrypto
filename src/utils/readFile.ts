/** Reads a file the user picked as text (FileReader works in every browser and in tests). */
export const readFileAsText = (file: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => { resolve(typeof reader.result === 'string' ? reader.result : ''); };
		reader.onerror = () => { reject(reader.error ?? new Error('Could not read the file')); };
		reader.readAsText(file);
	});
