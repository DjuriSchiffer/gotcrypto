import type { Store } from 'store';

import { createContext } from 'react';

export const StateContext = createContext<Store | undefined>(undefined);
