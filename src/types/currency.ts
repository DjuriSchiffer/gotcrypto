export type FetchedCurrency = {
  name: string;
  price: number;
  slug: string;
  cmc_id: number;
  cmc_rank: number | null;
};

export type TransactionType = 'buy' | 'sell';

export type Transaction = {
  amount: string;
  purchasePrice: string;
  date: string;
  id: string;
  type: TransactionType
};

export type Totals = {
  totalAmount: number;
  totalPurchasePrice: number;
  totalAveragePurchasePrice: number;
};

export type SelectedAsset = {
  name: string;
  slug: string;
  cmc_id: number;
  index: number;
  totals: Totals;
  transactions: Transaction[];
};
