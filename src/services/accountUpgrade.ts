import type { OAuthCredential } from 'firebase/auth';
import type { SelectedAsset } from 'currency';

import { GoogleAuthProvider, linkWithPopup, signInWithCredential } from 'firebase/auth';
import { runTransaction } from 'firebase/firestore';
import localforage from 'localforage';

import type { LocalData, MigrationPlan } from '../utils/migration';

import { auth, db } from '../firebase/firebaseConfig';
import { getUserDocRef } from '../firebase/firebaseHelpers';
import { classifyLinkError } from '../utils/authErrors';
import { planMigration } from '../utils/migration';
import { LOCAL_PORTFOLIO_KEY, PREFERENCE_KEYS } from '../utils/preferences';

export type UpgradeResult =
	| { credential: OAuthCredential; email: null | string; status: 'account-exists' }
	| { message: string; status: 'error' }
	| { migratedAssets: number; status: 'linked' }
	| { status: 'cancelled' }
	/** Linked, but the copy failed: the data is still in the browser and can be retried */
	| { status: 'copy-failed' };

/** Always show Google's account chooser, so nobody connects an account by accident. */
export const googleProvider = () => {
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({ prompt: 'select_account' });
	return provider;
};

const readLocalData = async (): Promise<LocalData> => {
	const entries = await Promise.all(
		PREFERENCE_KEYS.map(async (key) => [key, await localforage.getItem(key)] as const)
	);

	return {
		preferences: Object.fromEntries(entries),
		selectedCurrencies:
			(await localforage.getItem<Array<SelectedAsset>>(LOCAL_PORTFOLIO_KEY)) ?? [],
	};
};

const clearLocalData = async () => {
	await Promise.all(
		[LOCAL_PORTFOLIO_KEY, ...PREFERENCE_KEYS].map((key) => localforage.removeItem(key))
	);
};

/**
 * Copies the browser data into the user's Firestore document.
 * Runs in a transaction: the document is read and written atomically, and an account
 * that already has a portfolio is never written to (see planMigration).
 * Browser data is only removed after a successful write.
 */
export const copyLocalPortfolio = async (uid: string): Promise<MigrationPlan> => {
	const local = await readLocalData();
	const ref = getUserDocRef(uid);

	const plan = await runTransaction(db, async (transaction) => {
		const snapshot = await transaction.get(ref);
		const result = planMigration(local, snapshot.exists() ? snapshot.data() : undefined);

		if (result.kind === 'write') {
			transaction.set(ref, result.fields, { merge: true });
		}
		return result;
	});

	if (plan.kind === 'write') {
		await clearLocalData();
	}
	return plan;
};

/** Turns the current anonymous session into a Google account and moves its data along. */
export const upgradeAnonymousAccount = async (): Promise<UpgradeResult> => {
	const current = auth.currentUser;
	if (!current?.isAnonymous) {
		return {
			message: 'Only an anonymous session can be saved to a Google account.',
			status: 'error',
		};
	}

	let uid: string;
	try {
		({
			user: { uid },
		} = await linkWithPopup(current, googleProvider()));
	} catch (error) {
		return classifyLinkError(error);
	}

	try {
		const assetCount = (
			(await localforage.getItem<Array<SelectedAsset>>(LOCAL_PORTFOLIO_KEY)) ?? []
		).length;
		const plan = await copyLocalPortfolio(uid);
		return { migratedAssets: plan.kind === 'write' ? assetCount : 0, status: 'linked' };
	} catch (error) {
		console.error('Linked the account, but copying the portfolio failed:', error);
		return { status: 'copy-failed' };
	}
};

/**
 * Signs in to a Google account that is already in use, then tries to move this session's
 * portfolio into it. The copy only happens if that account's portfolio is empty
 * (see planMigration): an existing portfolio is never overwritten or merged into.
 *
 * Returns the migration plan, or null if the copy failed; in both non-write cases
 * the browser data stays where it is.
 */
export const signInToExistingAccount = async (
	credential: OAuthCredential
): Promise<MigrationPlan | null> => {
	const { user } = await signInWithCredential(auth, credential);

	try {
		return await copyLocalPortfolio(user.uid);
	} catch (error) {
		console.error('Signed in, but copying the portfolio failed:', error);
		return null;
	}
};
