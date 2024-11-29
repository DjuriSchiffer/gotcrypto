import { CurrencyQuote } from "api";

export type DashboardLayout = 'Grid' | 'Table'

export type DateLocale = 'nl' | 'en'

export interface Store {
  error: boolean;
  sortMethod: SortMethod;
  currencyQuote: keyof CurrencyQuote,
  dateLocale: DateLocale
  dashboardLayout: DashboardLayout
}

export type SortMethod = 'cmc_rank' | 'has_selected';

export type Action =
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SORT_METHOD'; payload: SortMethod }
  | { type: 'SET_CURRENCY_QUOTE'; payload: keyof CurrencyQuote }
  | { type: 'SET_DATE_LOCALE'; payload: DateLocale }
  | { type: 'SET_DASHBOARD_LAYOUT'; payload: DashboardLayout }

export interface GlobalTotals {
  totalAmount: number;
  totalValue: number;
  totalPurchasePrice: number;
  totalPercentageDifference: number;
  totalAveragePurchasePrice: number;
}
