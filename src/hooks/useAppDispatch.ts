import type { Dispatch } from 'react';
import type { Action } from 'store';

import { useContext } from 'react';

import { DispatchContext } from '../contexts/DispatchContext';

export const useAppDispatch = (): Dispatch<Action> => {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within a ReducerProvider');
  }
  return context;
};
