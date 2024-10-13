import { createContext } from 'react';
import { Store } from 'store';

export const StateContext = createContext<Store | undefined>(undefined);
