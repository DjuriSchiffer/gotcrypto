import type { User } from 'firebase/auth';

import { onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from '../contexts/AuthContext';
import { auth } from '../firebase/firebaseConfig';

type AuthState = {
	isAnonymous: boolean;
	user: null | User;
};

/** Reads the `admin` custom claim from the user's ID token (set with scripts/set-admin.cjs). */
const hasAdminClaim = async (currentUser: User): Promise<boolean> => {
	try {
		const { claims } = await currentUser.getIdTokenResult();
		return claims.admin === true;
	} catch (error) {
		console.error('Error checking admin status:', error);
		return false;
	}
};

const stateFor = (user: null | User): AuthState => ({
	// Stored separately: linking changes isAnonymous on the *same* User object,
	// which React wouldn't see as a change
	isAnonymous: user?.isAnonymous ?? false,
	user,
});

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>(stateFor(null));
	const [loading, setLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setState(stateFor(currentUser));
			setLoading(false);

			if (currentUser) {
				void hasAdminClaim(currentUser).then(setIsAdmin);
			} else {
				setIsAdmin(false);
			}
		});

		return () => {
			unsubscribe();
		};
	}, []);

	const refreshAuth = useCallback(() => {
		setState(stateFor(auth.currentUser));
	}, []);

	const value = useMemo(
		() => ({ ...state, isAdmin, loading, refreshAuth }),
		[state, isAdmin, loading, refreshAuth]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
