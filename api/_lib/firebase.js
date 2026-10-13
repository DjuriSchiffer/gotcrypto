const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Firestore for the API functions, initialized on first use instead of when the file loads.
 * A missing or wrong environment variable then fails one request with a clear log message,
 * instead of crashing the whole function before it can respond.
 */
const getDb = () => {
	if (getApps().length === 0) {
		const { FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID } = process.env;
		if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_PROJECT_ID) {
			throw new Error(
				'Missing Firebase environment variables (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID)'
			);
		}

		initializeApp({
			credential: cert({
				clientEmail: FIREBASE_CLIENT_EMAIL,
				privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
				projectId: FIREBASE_PROJECT_ID,
			}),
		});
	}

	return getFirestore();
};

module.exports = { getDb };
