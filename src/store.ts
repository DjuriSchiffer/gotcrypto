import { FetchedCurrency } from './types/currency';
import { GlobalTotals, SelectedCurrency } from './types/store';

export interface Store {
  fetchedCurrencies: Record<string, FetchedCurrency> | null;
  error: boolean;
  selectedCurrencies: SelectedCurrency[];
  globalTotals: GlobalTotals;
}

export type Action =
  | {
      type: 'SET_FETCHED_CURRENCIES';
      payload: Record<string, FetchedCurrency>;
    }
  | { type: 'SET_SELECTED_CURRENCIES'; payload: SelectedCurrency[] }
  | { type: 'SET_GLOBAL_TOTALS'; payload: GlobalTotals }
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

export const initialStore: Store = {
  fetchedCurrencies: null,
  error: false,
  selectedCurrencies: [],
  globalTotals: {
    totalAmount: 0,
    totalValue: 0,
    totalPurchasePrice: 0,
    totalPercentageDifference: 0,
    totalAveragePurchasePrice: 0,
  },
};

export const reducer = (state: Store, action: Action): Store => {
  switch (action.type) {
    case 'SET_FETCHED_CURRENCIES':
      return { ...state, fetchedCurrencies: action.payload };

    case 'SET_SELECTED_CURRENCIES':
      return { ...state, selectedCurrencies: action.payload };

    case 'SET_GLOBAL_TOTALS':
      return { ...state, globalTotals: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: false };

    default:
      return state;
  }
};
