export type FetchedCurrency = {
  name: string;
  price: number;
  slug: string;
  cmc_id: number;
  cmc_rank: number | null;
};

export type TransactionType = 'buy' | 'sell' | "transfer";
export type TransferType = 'in' | 'out';

export type Transaction = {
  amount: string;
  purchasePrice: string;
  date: string;
  id: string;
  type: TransactionType;
  transferType?: TransferType;
  description?: string;
};

export type Totals = {
  totalAmount: number;
  totalAmountBought: number;
  totalAmountSold: number;
  totalPurchasePrice: number;
  totalSellPrice: number;
  totalAveragePurchasePrice: number;
  totalAverageSellPrice: number,
  totalInvested: number
};

export type SelectedAsset = {
  name: string;
  slug: string;
  cmc_id: number;
  index: number;
  totals: Totals;
  transactions: Transaction[];
};
