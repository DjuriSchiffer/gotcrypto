import type { User } from 'firebase/auth';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { AuthContext } from '../contexts/AuthContext';
import { auth, db } from '../firebase/firebaseConfig';

type AdminConfig = {
  adminEmails: Array<string>;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | User>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        void checkAdminStatus(currentUser);
      } else {
        setIsAdmin(false);
      }
    });

    return () => { unsubscribe(); };
  }, []);

  const checkAdminStatus = async (currentUser: User): Promise<void> => {
    try {
      const adminDocRef = doc(db, 'admin', 'config');
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as AdminConfig;
        const adminEmails = adminData.adminEmails;
        setIsAdmin(adminEmails.includes(currentUser.email || ''));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const value = {
    isAdmin,
    isAnonymous: user ? user.isAnonymous : false,
    loading,
    user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };