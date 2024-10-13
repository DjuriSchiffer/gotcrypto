import { Dispatch, createContext } from 'react';
import { Action } from 'store';

export const DispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined
);
