import type { IconType } from 'react-icons';

import { FaFacebook, FaGoogle, FaMicrosoft, FaTwitter } from 'react-icons/fa';

import type { ProviderId } from '../../config/authProviders';

export const PROVIDER_ICONS: Record<ProviderId, IconType> = {
	'facebook.com': FaFacebook,
	'google.com': FaGoogle,
	'microsoft.com': FaMicrosoft,
	'twitter.com': FaTwitter,
};
