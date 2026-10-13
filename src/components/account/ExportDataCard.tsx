import type { CurrencyQuote } from 'api';
import type { SelectedAsset } from 'currency';

import { Button } from 'flowbite-react';
import { FaDownload } from 'react-icons/fa';

import { exportFileName, transactionsToCsv } from '../../utils/csvExport';
import { downloadFile } from '../../utils/download';
import SectionCard from '../ui/SectionCard';

type ExportDataCardProps = {
	assets: Array<SelectedAsset>;
	currencyQuote: keyof CurrencyQuote;
	/** Include the exclude_for_tax column (tax tools are admin-only) */
	includeTaxColumn?: boolean;
	isAnonymous: boolean;
};

/** Lets the user download all transactions as a CSV file. */
function ExportDataCard({
	assets,
	currencyQuote,
	includeTaxColumn = false,
	isAnonymous,
}: ExportDataCardProps) {
	const transactionCount = assets.reduce((sum, asset) => sum + asset.transactions.length, 0);
	const assetCount = assets.filter((asset) => asset.transactions.length > 0).length;

	const handleExport = () => {
		downloadFile(
			exportFileName(new Date()),
			transactionsToCsv(assets, currencyQuote, { includeTaxColumn })
		);
	};

	return (
		<SectionCard description="Download your transactions" title="Export data">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="text-sm">
					<p className="font-medium text-gray-900 dark:text-white">Export transactions (CSV)</p>
					<p className="text-gray-500 dark:text-gray-400">
						{transactionCount === 0
							? 'No transactions to export yet.'
							: `${transactionCount} ${transactionCount === 1 ? 'transaction' : 'transactions'} in ${assetCount} ${assetCount === 1 ? 'asset' : 'assets'}, with prices in ${currencyQuote}.`}
					</p>
					{isAnonymous && transactionCount > 0 && (
						<p className="mt-1 text-amber-700 dark:text-amber-400">
							Your data only lives in this browser. Exporting regularly keeps a backup.
						</p>
					)}
				</div>
				<Button color="gray" disabled={transactionCount === 0} onClick={handleExport}>
					<FaDownload className="mr-2" />
					Export CSV
				</Button>
			</div>
		</SectionCard>
	);
}

export default ExportDataCard;
