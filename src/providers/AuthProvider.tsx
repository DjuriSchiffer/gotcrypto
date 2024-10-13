import { User, onAuthStateChanged } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { auth } from '../firebase/firebaseConfig';

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsAnonymous(currentUser.isAnonymous);
      } else {
        setIsAnonymous(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};
