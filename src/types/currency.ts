export type FetchedCurrency = {
	cmc_id: number;
	cmc_rank: null | number;
	name: string;
	price: number;
	slug: string;
};

export type TransactionType = 'buy' | 'sell' | 'transfer';
export type TransferType = 'in' | 'out';

export type Transaction = {
	amount: string;
	date: string;
	description?: string;
	excludeForTax?: boolean;
	id: string;
	purchasePrice: string;
	transferType?: TransferType;
	type: TransactionType;
};

export type Totals = {
	totalAmount: number;
	totalAmountBought: number;
	totalAmountSold: number;
	/** Average cost per coin of what you currently hold */
	totalAverageCost: number;
	/** Average price per coin across all buys ever (unaffected by sells) */
	totalAveragePurchasePrice: number;
	totalAverageSellPrice: number;
	/** What the coins you currently hold cost you */
	totalCostBasis: number;
	/** Sum of buys minus sum of sell proceeds. Can be negative. */
	totalNetCashFlow: number;
	totalPurchasePrice: number;
	/** Sell proceeds minus the cost of the coins sold */
	totalRealizedProfit: number;
	totalSellPrice: number;
};

export type SelectedAsset = {
	cmc_id: number;
	index: number;
	name: string;
	slug: string;
	totals: Totals;
	transactions: Array<Transaction>;
};
