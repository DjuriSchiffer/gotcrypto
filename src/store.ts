import { Action, Store } from 'store';

export const initialStore: Store = {
  fetchedCurrencies: null,
  error: false,
  globalTotals: {
    totalAmount: 0,
    totalValue: 0,
    totalPurchasePrice: 0,
    totalPercentageDifference: 0,
    totalAveragePurchasePrice: 0,
  },
  sortMethod: 'cmc_rank',
};

export const reducer = (state: Store, action: Action): Store => {
  switch (action.type) {
    case 'SET_FETCHED_CURRENCIES':
      return { ...state, fetchedCurrencies: action.payload };

    case 'SET_GLOBAL_TOTALS':
      return { ...state, globalTotals: action.payload };

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
