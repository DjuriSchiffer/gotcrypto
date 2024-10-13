import { ReactNode, useReducer } from 'react';
import { reducer, initialStore } from '../store';
import { StateContext } from '../contexts/StateContext';
import { DispatchContext } from '../contexts/DispatchContext';

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
