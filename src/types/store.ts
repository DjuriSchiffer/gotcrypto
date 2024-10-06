import { FetchedCurrency, SelectedCurrency } from 'currency';

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

export interface GlobalTotals {
  totalAmount: number;
  totalValue: number;
  totalPurchasePrice: number;
  totalPercentageDifference: number;
  totalAveragePurchasePrice: number;
}
