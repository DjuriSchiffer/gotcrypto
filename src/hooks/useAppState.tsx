import React, {
  useContext,
} from 'react';
import { Store } from 'store';
import { StateContext } from '../contexts/StateContext';

export const useAppState = (): Store => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a ReducerProvider');
  }
  return context;
};
