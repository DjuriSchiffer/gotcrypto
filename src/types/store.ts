import type { CurrencyQuote } from 'api';

export type DashboardLayout = 'Grid' | 'Table';

export type DateLocale = 'en' | 'nl';

export type Store = {
	currencyQuote: keyof CurrencyQuote;
	dashboardLayout: DashboardLayout;
	dateLocale: DateLocale;
	error: boolean;
	sortMethod: SortMethod;
};

export type SortMethod = 'cmc_rank' | 'has_selected';

export type Action =
	| { payload: boolean; type: 'SET_ERROR' }
	| { payload: DashboardLayout; type: 'SET_DASHBOARD_LAYOUT' }
	| { payload: DateLocale; type: 'SET_DATE_LOCALE' }
	| { payload: keyof CurrencyQuote; type: 'SET_CURRENCY_QUOTE' }
	| { payload: SortMethod; type: 'SET_SORT_METHOD' };

export type GlobalTotals = {
	totalAmount: number;
	totalAveragePurchasePrice: number;
	totalInvested: number;
	totalPercentageDifference: number;
	totalPurchasePrice: number;
	totalValue: number;
};
