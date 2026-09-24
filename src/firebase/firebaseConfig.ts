import type { Analytics } from 'firebase/analytics';

import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);

/**
 * Resolves to Analytics where it's supported, or null (tests, some browsers, blocked cookies).
 */
export const analyticsPromise: Promise<Analytics | null> = isSupported()
	.then((supported) => (supported ? getAnalytics(app) : null))
	.catch(() => null);

export const db = getFirestore(app);

export const auth = getAuth(app);
