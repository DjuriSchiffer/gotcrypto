import type { ReactNode } from 'react';

import { useReducer } from 'react';

import { DispatchContext } from '../contexts/DispatchContext';
import { StateContext } from '../contexts/StateContext';
import { initialStore, reducer } from '../store';

type ReducerProviderProps = {
  children: ReactNode;
};

function ReducerProvider({ children }: ReducerProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialStore);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export default ReducerProvider;