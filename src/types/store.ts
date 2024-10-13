import { FetchedCurrency } from 'currency';

export interface Store {
  fetchedCurrencies: FetchedCurrency[] | null;
  error: boolean;
  globalTotals: GlobalTotals;
}

export type Action =
  | {
      type: 'SET_FETCHED_CURRENCIES';
      payload: FetchedCurrency[];
    }
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
