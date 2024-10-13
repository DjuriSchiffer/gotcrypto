import React, { useContext, Dispatch } from 'react';
import { Action } from 'store';
import { DispatchContext } from '../contexts/DispatchContext';

export const useAppDispatch = (): Dispatch<Action> => {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within a ReducerProvider');
  }
  return context;
};
