import { afterEach, describe, expect, it } from 'vitest';

import { contactMailto } from './contact';
import { PRIVACY } from './privacy';

describe('contactMailto', () => {
	const original = PRIVACY.contactEmail;

	afterEach(() => {
		PRIVACY.contactEmail = original;
	});

	it('builds a mail link with a readable subject and body', () => {
		PRIVACY.contactEmail = 'me@example.com';

		expect(contactMailto('Got Crypto feedback', 'Error reference: abc')).toBe(
			'mailto:me@example.com?subject=Got%20Crypto%20feedback&body=Error%20reference%3A%20abc'
		);
	});

	it('gives no link while the address is empty', () => {
		PRIVACY.contactEmail = '';

		expect(contactMailto('Got Crypto feedback')).toBeNull();
	});
});
