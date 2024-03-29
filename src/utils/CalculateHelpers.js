export function PercentageDifference(purchasePrice, currentValue) {
  if (purchasePrice === 0 || currentValue === 0) return 0;
  return ((currentValue * 100) / purchasePrice - 100).toFixed(2);
}

export function PercentageFormat(data) {
  return parseFloat(data).toFixed(2) + "%";
}

export function CurrentValue(amount, currentPrice) {
  return amount * currentPrice;
}

export function Profit(currentValue, purchasePrice) {
  return currentValue - purchasePrice;
}

export function AveragePurchasePrice(purchasePrice, amount) {
  return purchasePrice / amount;
}

export function CurrencyFormat(data) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(data);
}

export function DateFormat(d) {
  const date = new Date(d);
  return date.toLocaleDateString("nl", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDatePickerDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}