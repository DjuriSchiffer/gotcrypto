import { Action, Store } from 'store';

export const initialStore: Store = {
  error: false,
  sortMethod: 'has_selected',
  currencyQuote: 'EUR'
};

export const reducer = (state: Store, action: Action): Store => {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SORT_METHOD':
      return { ...state, sortMethod: action.payload };

    case 'SET_CURRENCY_QUOTE':
      return { ...state, currencyQuote: action.payload };

    default:
      return state;
  }
};
