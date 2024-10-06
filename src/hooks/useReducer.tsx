import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';
import { reducer, initialStore } from '../store';
import { Action, Store } from 'store';

const StateContext = createContext<Store | undefined>(undefined);
const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

type ReducerProviderProps = {
  children: ReactNode;
};

const ReducerProvider: React.FC<ReducerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialStore);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export default ReducerProvider;

export const useAppState = (): Store => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a ReducerProvider');
  }
  return context;
};

export const useAppDispatch = (): Dispatch<Action> => {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within a ReducerProvider');
  }
  return context;
};
