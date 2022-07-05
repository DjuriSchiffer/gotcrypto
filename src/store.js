export const initialStore = {
    currencies: null,
    error: false,
    selectedCurrencies: [],
    globalTotals: {}
};

export const reducer = (state, action) => {
    switch (action.type) {
        /*
         * Initial prices load
         */
        case "SET_INITIAL_CURRENCIES":
            return { ...state, currencies: action.payload };

        /*
        * Initial selected currencies
        */
        case "SET_SELECTED_CURRENCIES":
            return { ...state, selectedCurrencies: action.payload };

        /*
        * Initial global totals
        */
        case "SET_GLOBAL_TOTALS":
            return { ...state, globalTotals: action.payload };

        /*
         * Initial error handling
         */
        case "SET_ERROR":
            return { ...state, error: true };
        default:
            return state;
    }
};