import { createContext, useContext, useReducer } from "react";
import { reducer, initialStore } from "../store";

const StateContext = createContext();
const DispatchContext = createContext();

const Reducer = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialStore);

    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
};

export default Reducer;

export const useState = () => useContext(StateContext);
export const useDispatch = () => useContext(DispatchContext);