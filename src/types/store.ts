import { FetchedCurrency } from 'currency';

export interface Store {
  fetchedCurrencies: FetchedCurrency[] | null;
  error: boolean;
  globalTotals: GlobalTotals;
  sortMethod: SortMethod;
  customOrder: number[];
}

export type SortMethod =
  | 'alphabet-asc'
  | 'alphabet-desc'
  | 'cmc_rank'
  | 'latest-added'
  | 'custom';

export type Action =
  | {
      type: 'SET_FETCHED_CURRENCIES';
      payload: FetchedCurrency[];
    }
  | { type: 'SET_GLOBAL_TOTALS'; payload: GlobalTotals }
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SORT_METHOD'; payload: SortMethod }
  | { type: 'SET_CUSTOM_ORDER'; payload: number[] };

export interface GlobalTotals {
  totalAmount: number;
  totalValue: number;
  totalPurchasePrice: number;
  totalPercentageDifference: number;
  totalAveragePurchasePrice: number;
}
