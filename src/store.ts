import { Action, Store } from 'store';

export const initialStore: Store = {
  fetchedCurrencies: null,
  error: false,
  sortMethod: 'has_selected',
};

export const reducer = (state: Store, action: Action): Store => {
  switch (action.type) {
    case 'SET_FETCHED_CURRENCIES':
      return { ...state, fetchedCurrencies: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: false };

    case 'SET_SORT_METHOD':
      return { ...state, sortMethod: action.payload };

    default:
      return state;
  }
};
