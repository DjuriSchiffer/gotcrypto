import React, { createContext } from 'react';
import { User } from 'firebase/auth';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
