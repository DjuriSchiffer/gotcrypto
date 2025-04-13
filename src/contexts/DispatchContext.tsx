import type { Dispatch } from 'react';
import type { Action } from 'store';

import { createContext } from 'react';

export const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined);
