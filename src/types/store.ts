export interface Asset {
  amount: string;
  purchasePrice: string;
  date: string;
  id: string;
}

export type SelectedCurrency = {
  name: string;
  slug: string;
  cmc_id: number;
  index: number;
  totals: {
    totalAmount: number;
    totalPurchasePrice: number;
    totalAveragePurchasePrice: number;
  };
  assets: Asset[];
};

export interface GlobalTotals {
  totalAmount: number;
  totalValue: number;
  totalPurchasePrice: number;
  totalPercentageDifference: number;
  totalAveragePurchasePrice: number;
}
