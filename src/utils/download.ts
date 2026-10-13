/** Lets the browser save `content` as a file, without a server round trip. */
export const downloadFile = (
	fileName: string,
	content: string,
	type = 'text/csv;charset=utf-8'
) => {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();
	// Give the browser a moment to start the download before releasing the file
	setTimeout(() => { URL.revokeObjectURL(url); }, 1000);
};
