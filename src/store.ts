import { Currency, GlobalTotals } from './types/store';

export interface Store {
  currencies: Record<
    string,
    { name: string; price: number; slug: string; cmc_id: number }
  > | null;
  error: boolean;
  selectedCurrencies: Currency[];
  globalTotals: GlobalTotals;
}

export type Action =
  | {
      type: 'SET_INITIAL_CURRENCIES';
      payload: Record<
        string,
        { name: string; price: number; slug: string; cmc_id: number }
      >;
    }
  | { type: 'SET_SELECTED_CURRENCIES'; payload: Currency[] }
  | { type: 'SET_GLOBAL_TOTALS'; payload: GlobalTotals }
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

export const initialStore: Store = {
  currencies: null,
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
    case 'SET_INITIAL_CURRENCIES':
      return { ...state, currencies: action.payload };

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
