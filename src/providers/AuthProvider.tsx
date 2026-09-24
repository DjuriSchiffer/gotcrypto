import type { User } from 'firebase/auth';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { AuthContext } from '../contexts/AuthContext';
import { auth } from '../firebase/firebaseConfig';

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

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<null | User>(null);
	const [loading, setLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
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

	const value = {
		isAdmin,
		isAnonymous: user ? user.isAnonymous : false,
		loading,
		user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
