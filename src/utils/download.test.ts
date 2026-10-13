import { describe, expect, it, vi } from 'vitest';

import { downloadFile } from './download';

describe('downloadFile', () => {
	it('saves the content under the given file name', () => {
		const createObjectURL = vi.fn(() => 'blob:test');
		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement
		) {
			expect(this.download).toBe('export.csv');
			expect(this.getAttribute('href')).toBe('blob:test');
		});

		downloadFile('export.csv', 'a,b\r\n');

		expect(click).toHaveBeenCalledOnce();
		const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
		// jsdom's Blob can't be read back, so check what it was built from
		expect(blob.size).toBe('a,b\r\n'.length);
		expect(blob.type).toBe('text/csv;charset=utf-8');
		expect(document.querySelector('a')).toBeNull(); // cleaned up

		vi.unstubAllGlobals();
		click.mockRestore();
	});
});
