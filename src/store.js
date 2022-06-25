export const initialStore = {
    assets: null,
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

        case "SET_SELECTED_CURRENCIES":
            return { ...state, selectedCurrencies: action.payload };

        case "SET_ASSETS":
            return { ...state, assets: action.payload };

        /*
         * Initial error handling
         */
        case "SET_ERROR":
            return { ...state, error: true };
        default:
            return state;
    }
};