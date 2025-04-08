export type FetchedCurrency = {
  cmc_id: number;
  cmc_rank: null | number;
  name: string;
  price: number;
  slug: string;
};

export type TransactionType = "transfer" | 'buy' | 'sell';
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
  totalAveragePurchasePrice: number;
  totalAverageSellPrice: number,
  totalInvested: number
  totalPurchasePrice: number;
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
