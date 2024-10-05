export interface Asset {
  amount: string;
  purchasePrice: string;
  index: number;
  date: string;
  id: string;
  totals: {
    totalAmount: number;
    totalPurchasePrice: number;
  };
}

export type SelectedCurreny = {
  name: string;
  slug: string;
  cmc_id: number;
  index: number;
  assets: Asset[];
  totals: {
    totalAmount: number;
    totalPurchasePrice: number;
    totalAveragePurchasePrice: number;
  };
};

export interface Currency {
  name: string;
  price: number;
  slug: string;
  cmc_id: number;
  amount: string;
  purchasePrice: string;
  index: number;
  date: Date;
  totals: {
    totalAmount: number;
    totalPurchasePrice: number;
  };
  assets: Asset[];
}

export interface GlobalTotals {
  totalAmount: number;
  totalValue: number;
  totalPurchasePrice: number;
  totalPercentageDifference: number;
  totalAveragePurchasePrice: number;
}
