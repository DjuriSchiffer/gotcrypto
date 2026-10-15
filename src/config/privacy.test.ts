import { describe, expect, it } from 'vitest';

import { PRIVACY } from './privacy';

// The privacy page shows these. This fails until they're filled in, so the page never goes live empty.
describe('privacy details', () => {
	it.each(Object.entries(PRIVACY))('%s is filled in', (_key, value) => {
		expect(value.trim()).not.toBe('');
	});
});
