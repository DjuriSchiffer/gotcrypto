import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	auth: {
		currentUser: null as null | {
			email: string;
			isAnonymous: boolean;
			providerData?: Array<{ providerId: string }>;
			uid: string;
		},
	},
	calls: [] as Array<string>,
	deleteDoc: vi.fn(),
	deleteUser: vi.fn(),
	reauthenticateWithPopup: vi.fn(),
	removeItem: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock('../firebase/firebaseConfig', () => ({ auth: mocks.auth, db: {} }));
/** A fake provider that remembers how it was set up (hoisted, because vi.mock below uses it) */
const fakeProvider = vi.hoisted(() => (providerId: string) =>
	class {
		parameters: Record<string, string> = {};
		providerId = providerId;
		scopes: Array<string> = [];
		addScope(scope: string) {
			this.scopes.push(scope);
			return this;
		}
		setCustomParameters(parameters: Record<string, string>) {
			this.parameters = parameters;
			return this;
		}
	}
);

vi.mock('firebase/auth', () => ({
	deleteUser: mocks.deleteUser,
	FacebookAuthProvider: fakeProvider('facebook.com'),
	GoogleAuthProvider: fakeProvider('google.com'),
	OAuthProvider: class extends fakeProvider('') {
		constructor(id: string) {
			super();
			this.providerId = id;
		}
	},
	reauthenticateWithPopup: mocks.reauthenticateWithPopup,
	signInAnonymously: vi.fn(),
	signInWithPopup: vi.fn(),
	signOut: mocks.signOut,
	TwitterAuthProvider: fakeProvider('twitter.com'),
}));
vi.mock('firebase/firestore', () => ({
	deleteDoc: mocks.deleteDoc,
	doc: (_db: unknown, ...path: Array<string>) => ({ path: path.join('/') }),
	setDoc: vi.fn(),
}));
vi.mock('localforage', () => ({ default: { removeItem: mocks.removeItem } }));

import { createProvider, deleteAccount } from './authService';

/** Every mock records its name when called, so the tests can check the order */
const record = (name: string, result?: () => unknown) =>
	vi.fn(() => {
		mocks.calls.push(name);
		return Promise.resolve(result?.());
	});

const fail = (code: string) => () => {
	throw Object.assign(new Error(code), { code });
};

describe('deleteAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.calls = [];
		mocks.deleteDoc.mockImplementation(record('deleteDoc'));
		mocks.deleteUser.mockImplementation(record('deleteUser'));
		mocks.reauthenticateWithPopup.mockImplementation(record('reauthenticate'));
		mocks.removeItem.mockImplementation(record('removeItem'));
		mocks.signOut.mockImplementation(record('signOut'));
	});

	describe('with a Google account', () => {
		beforeEach(() => {
			mocks.auth.currentUser = { email: 'me@example.com', isAnonymous: false, uid: 'uid-1' };
		});

		it('confirms with the provider the user signs in with', async () => {
			mocks.auth.currentUser = {
				email: 'me@example.com',
				isAnonymous: false,
				providerData: [{ providerId: 'microsoft.com' }],
				uid: 'uid-1',
			};

			await deleteAccount();

			expect(mocks.reauthenticateWithPopup.mock.calls[0][1]).toMatchObject({
				providerId: 'microsoft.com',
			});
		});

		it('confirms with Google first, then deletes the document, then the login', async () => {
			await deleteAccount();

			expect(mocks.calls).toEqual(['reauthenticate', 'deleteDoc', 'deleteUser']);
			expect(mocks.deleteDoc).toHaveBeenCalledWith({ path: 'users/uid-1' });
		});

		it("leaves the browser's data alone: it may belong to someone else's session", async () => {
			await deleteAccount();

			expect(mocks.removeItem).not.toHaveBeenCalled();
		});

		it('deletes nothing when the user closes the Google window', async () => {
			mocks.reauthenticateWithPopup.mockImplementation(fail('auth/popup-closed-by-user'));

			await expect(deleteAccount()).rejects.toMatchObject({ code: 'auth/popup-closed-by-user' });
			expect(mocks.deleteDoc).not.toHaveBeenCalled();
			expect(mocks.deleteUser).not.toHaveBeenCalled();
		});

		it('deletes nothing when the user picks a different Google account', async () => {
			mocks.reauthenticateWithPopup.mockImplementation(fail('auth/user-mismatch'));

			await expect(deleteAccount()).rejects.toMatchObject({ code: 'auth/user-mismatch' });
			expect(mocks.deleteDoc).not.toHaveBeenCalled();
		});

		it('reports it when deleting the login fails', async () => {
			mocks.deleteUser.mockImplementation(fail('auth/network-request-failed'));

			await expect(deleteAccount()).rejects.toMatchObject({ code: 'auth/network-request-failed' });
			expect(mocks.signOut).not.toHaveBeenCalled();
		});
	});

	describe('with an anonymous session', () => {
		beforeEach(() => {
			mocks.auth.currentUser = { email: '', isAnonymous: true, uid: 'anon-1' };
		});

		it("removes the browser's portfolio and preferences, then the login", async () => {
			await deleteAccount();

			expect(mocks.removeItem.mock.calls.map(([key]) => key as string)).toEqual([
				'selectedCurrencies',
				'currencyQuote',
				'dashboardLayout',
				'dateLocale',
				'onboardingCompleted',
				'sortMethod',
			]);
			expect(mocks.calls.at(-1)).toBe('deleteUser');
			expect(mocks.reauthenticateWithPopup).not.toHaveBeenCalled();
			expect(mocks.deleteDoc).not.toHaveBeenCalled();
		});

		it('signs out when the login itself cannot be deleted', async () => {
			mocks.deleteUser.mockImplementation(fail('auth/requires-recent-login'));

			await deleteAccount();

			expect(mocks.signOut).toHaveBeenCalledOnce();
		});
	});

	it('refuses when nobody is signed in', async () => {
		mocks.auth.currentUser = null;

		await expect(deleteAccount()).rejects.toThrow('Nobody is signed in');
	});
});

describe('createProvider', () => {
	it('always shows the account chooser for Google and Microsoft', () => {
		expect(createProvider('google.com')).toMatchObject({ parameters: { prompt: 'select_account' } });
		expect(createProvider('microsoft.com')).toMatchObject({
			parameters: { prompt: 'select_account' },
			providerId: 'microsoft.com',
		});
	});

	it('asks Facebook for the email address', () => {
		expect(createProvider('facebook.com')).toMatchObject({ scopes: ['email'] });
	});

	it('creates an X provider', () => {
		expect(createProvider('twitter.com')).toMatchObject({ providerId: 'twitter.com' });
	});
});
