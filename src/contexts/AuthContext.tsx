import type { User } from 'firebase/auth';

import { createContext } from 'react';

export type AuthContextType = {
  isAdmin: boolean;
  isAnonymous: boolean;
  loading: boolean;
  user: null | User;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
