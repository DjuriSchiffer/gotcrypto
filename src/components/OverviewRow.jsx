import { useEffect, useState, useCallback } from "react";
import { PercentageDifference, PercentageFormat, CurrencyFormat, AveragePurchasePrice, Profit, CurrentValue, DateFormat } from '../utils/CalculateHelpers';
import localForage from "localforage";

const OverviewRow = ({asset, currentCurrency, children}) => {
    const amount = asset.amount;
    const purchasePrice = asset.purchasePrice;
    const purchaseDate = DateFormat(asset.date);
    const currentValue = CurrentValue(amount, currentCurrency.price);
    const averagePurchasePrice = AveragePurchasePrice(purchasePrice, amount);
    const percentageDifference = PercentageDifference(purchasePrice, currentValue);

    return (
        <div>
            {asset.amount}
            {CurrencyFormat(purchasePrice)}
            {purchaseDate}
            {CurrencyFormat(currentValue)}
            {CurrencyFormat(averagePurchasePrice)}
            {PercentageFormat(percentageDifference)}
            {children}
        </div>
    );
};

export default OverviewRow;