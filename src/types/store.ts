import { CurrencyQuote } from "api";

export interface Store {
  error: boolean;
  sortMethod: SortMethod;
  currencyQuote: keyof CurrencyQuote
}

export type SortMethod = 'cmc_rank' | 'has_selected';

export type Action =
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SORT_METHOD'; payload: SortMethod }
  | { type: 'SET_CURRENCY_QUOTE'; payload: keyof CurrencyQuote }

export interface GlobalTotals {
  totalAmount: number;
  totalValue: number;
  totalPurchasePrice: number;
  totalPercentageDifference: number;
  totalAveragePurchasePrice: number;
}
