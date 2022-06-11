export const initialStore = {
    currencies: null,
    error: false
};

export const reducer = (state, action) => {
    switch (action.type) {
        /*
         * Initial prices load
         */
        case "SET_INITIAL_CURRENCIES":
            return { ...state, currencies: action.payload };

        /*
         * Initial error handling
         */
        case "SET_ERROR":
            return { ...state, error: true };
        default:
            return state;
    }
};