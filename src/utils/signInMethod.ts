import type { ProviderId } from '../config/authProviders';

import { isProviderId } from '../config/authProviders';

/**
 * Which provider the user signs in with: the first one on their account that the app knows.
 * Anything unknown counts as Google, the only option before. Takes a partial user, so it also
 * works with the simple users tests pass around.
 */
export const primaryProvider = (user: {
	isAnonymous?: boolean;
	providerData?: ReadonlyArray<{ providerId: string }>;
}): 'anonymous' | ProviderId => {
	if (user.isAnonymous) return 'anonymous';
	const known = (user.providerData ?? [])
		.map((provider) => provider.providerId)
		.find(isProviderId);
	return known ?? 'google.com';
};
