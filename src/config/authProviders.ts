export type ProviderId = 'facebook.com' | 'google.com' | 'microsoft.com' | 'twitter.com';

export const PROVIDER_LABELS: Record<ProviderId, string> = {
	'facebook.com': 'Facebook',
	'google.com': 'Google',
	'microsoft.com': 'Microsoft',
	'twitter.com': 'X',
};

export const ENABLED_PROVIDERS: ReadonlyArray<ProviderId> = [
	'google.com',
	// 'microsoft.com',
	// 'twitter.com',
	// 'facebook.com'
];

export const isProviderId = (value: string): value is ProviderId => value in PROVIDER_LABELS;
