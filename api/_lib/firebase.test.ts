import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { requireApi } from './helpers';

const { getDb } = requireApi('./_lib/firebase.js') as { getDb: () => { collection: unknown } };

describe('getDb', () => {
	// This order matters: once initialized, the app is reused for the rest of this file
	it('explains which environment variables are missing', () => {
		delete process.env.FIREBASE_PRIVATE_KEY;

		expect(() => getDb()).toThrow(/Missing Firebase environment variables/);
	});

	it('initializes Firestore with the firebase-admin version that is installed', () => {
		// A throwaway key: firebase-admin checks that the key is a valid PEM. Nothing connects.
		const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
		process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
		process.env.FIREBASE_CLIENT_EMAIL = 'test@demo-gotcrypto.iam.gserviceaccount.com';
		process.env.FIREBASE_PROJECT_ID = 'demo-gotcrypto';

		expect(typeof getDb().collection).toBe('function');
	});
});
