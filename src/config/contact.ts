import { PRIVACY } from './privacy';

/** A mailto link to the contact address, or null while it isn't filled in. */
export const contactMailto = (subject: string, body?: string): null | string => {
	if (!PRIVACY.contactEmail) return null;

	const params = new URLSearchParams({ subject, ...(body ? { body } : {}) });
	// URLSearchParams writes spaces as "+", which mail apps show literally
	return `mailto:${PRIVACY.contactEmail}?${params.toString().replace(/\+/g, '%20')}`;
};
