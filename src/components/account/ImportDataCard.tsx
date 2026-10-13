import type { CurrencyQuote } from 'api';
import type { FetchedCurrency, SelectedAsset } from 'currency';

import { Alert, Button, Spinner } from 'flowbite-react';
import { useRef, useState } from 'react';
import { FaFileImport } from 'react-icons/fa';

import type { ImportPlan } from '../../utils/csvImport';

import {
	applyImport,
	estimatePortfolioBytes,
	MAX_IMPORT_BYTES,
	MAX_PORTFOLIO_BYTES,
	planImport,
} from '../../utils/csvImport';
import { getImage } from '../../utils/images';
import { readFileAsText } from '../../utils/readFile';
import Modal from '../Modal';
import SectionCard from '../ui/SectionCard';

/** How many row errors the preview lists before summarizing the rest. */
const MAX_ERRORS_SHOWN = 8;

type ImportDataCardProps = {
	assets: Array<SelectedAsset>;
	currencyQuote: keyof CurrencyQuote;
	/** Undefined while the coin list is loading */
	fetchedCurrencies: Array<FetchedCurrency> | undefined;
	/** Read the exclude_for_tax column (tax tools are admin-only) */
	includeTaxColumn?: boolean;
	onImport: (assets: Array<SelectedAsset>) => Promise<void>;
};

type Status = null | { message: string; tone: 'failure' | 'success' };

const plural = (count: number, word: string) => `${String(count)} ${word}${count === 1 ? '' : 's'}`;

/** Lets the user add transactions from a CSV file, after previewing what will change. */
function ImportDataCard({
	assets,
	currencyQuote,
	fetchedCurrencies,
	includeTaxColumn = false,
	onImport,
}: ImportDataCardProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [plan, setPlan] = useState<ImportPlan | null>(null);
	const [fileName, setFileName] = useState('');
	const [status, setStatus] = useState<Status>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState(false);
	const [tooLarge, setTooLarge] = useState(false);

	const closePreview = () => {
		setPlan(null);
		setSaveError(false);
		setTooLarge(false);
	};

	const handleFile = async (file: File | undefined) => {
		// Allow picking the same file again later
		if (inputRef.current) inputRef.current.value = '';
		if (!file || !fetchedCurrencies) return;

		setStatus(null);
		if (file.size > MAX_IMPORT_BYTES) {
			setStatus({
				message: 'This file is too large to be a transaction export (max 2 MB).',
				tone: 'failure',
			});
			return;
		}

		try {
			const text = await readFileAsText(file);
			const result = planImport(text, assets, {
				currencyQuote,
				fetchedCurrencies,
				includeTaxColumn,
			});
			if (result.fileError) {
				setStatus({ message: result.fileError, tone: 'failure' });
				return;
			}
			setFileName(file.name);
			setSaveError(false);
			// Checked up front, so the user doesn't run into a failed save
			setTooLarge(estimatePortfolioBytes(applyImport(assets, result)) > MAX_PORTFOLIO_BYTES);
			setPlan(result);
		} catch (error) {
			console.error('Failed to read import file:', error);
			setStatus({ message: "This file couldn't be read. Is it a CSV file?", tone: 'failure' });
		}
	};

	const handleConfirm = async () => {
		if (!plan) return;
		setIsSaving(true);
		setSaveError(false);
		try {
			await onImport(applyImport(assets, plan));
			setStatus({
				message: `Imported ${plural(plan.items.length, 'transaction')}.`,
				tone: 'success',
			});
			closePreview();
		} catch (error) {
			// Shown in the dialog, which stays open so the user can try again
			console.error('Failed to save imported transactions:', error);
			setSaveError(true);
		} finally {
			setIsSaving(false);
		}
	};

	const coinsInPlan = new Set(plan?.items.map((item) => item.cmcId)).size;

	return (
		<SectionCard
			description="Add transactions from a CSV file, like an export from Got Crypto"
			title="Import data"
		>
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
						Existing transactions are never changed. You'll see what will be added before anything
						is saved, and transactions you already have are skipped.
					</p>
					<Button
						color="gray"
						disabled={!fetchedCurrencies}
						onClick={() => inputRef.current?.click()}
					>
						{fetchedCurrencies ? (
							<FaFileImport className="mr-2" />
						) : (
							<Spinner className="mr-2" size="sm" />
						)}
						Choose CSV file
					</Button>
					<input
						accept=".csv,text/csv"
						aria-label="CSV file to import"
						className="hidden"
						onChange={(event) => void handleFile(event.target.files?.[0])}
						ref={inputRef}
						type="file"
					/>
				</div>

				{status && <Alert color={status.tone}>{status.message}</Alert>}
			</div>

			<Modal onClose={closePreview} open={plan !== null} size="2xl" title="Import transactions">
				{plan && (
					<div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
						<p>
							<span className="font-medium text-gray-900 dark:text-white">{fileName}</span>
						</p>

						<ul className="flex flex-col gap-1">
							<li>
								<strong className="text-gray-900 dark:text-white">
									{plural(plan.items.length, 'new transaction')}
								</strong>
								{plan.items.length > 0 && ` in ${plural(coinsInPlan, 'coin')}`}
							</li>
							{plan.duplicates > 0 && (
								<li>
									{plural(plan.duplicates, 'transaction')} you already have, which will be skipped
								</li>
							)}
							{plan.errors.length > 0 && (
								<li className="text-red-600 dark:text-red-400">
									{plural(plan.errors.length, 'row')} that can't be imported
								</li>
							)}
						</ul>

						{plan.newCoins.length > 0 && (
							<div className="flex flex-col gap-2">
								<p>These coins will be added to your dashboard:</p>
								<ul className="flex flex-wrap gap-2">
									{plan.newCoins.map((coin) => (
										<li
											className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
											key={coin.cmc_id}
										>
											<img alt="" className="h-5 w-5 rounded-full" src={getImage(coin.cmc_id)} />
											{coin.name}
										</li>
									))}
								</ul>
							</div>
						)}

						{plan.errors.length > 0 && (
							<div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
								<ul aria-label="Rows that can't be imported" className="flex flex-col gap-1">
									{plan.errors.slice(0, MAX_ERRORS_SHOWN).map((error) => (
										<li key={error.line}>
											<span className="font-medium text-gray-900 dark:text-white">
												Line {error.line}:
											</span>{' '}
											{error.message}
										</li>
									))}
								</ul>
								{plan.errors.length > MAX_ERRORS_SHOWN && (
									<p className="mt-2">
										…and {plural(plan.errors.length - MAX_ERRORS_SHOWN, 'more row')}.
									</p>
								)}
							</div>
						)}

						{tooLarge && (
							<Alert color="warning">
								With these transactions, your portfolio would be too large to save. Split the file
								and import fewer transactions at a time.
							</Alert>
						)}

						{saveError && (
							<Alert color="failure">
								Saving the import failed. Your portfolio is unchanged. Please try again.
							</Alert>
						)}

						<div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
							<Button color="gray" onClick={closePreview}>
								Cancel
							</Button>
							<Button
								color="primary"
								disabled={plan.items.length === 0 || isSaving || tooLarge}
								onClick={() => void handleConfirm()}
							>
								{isSaving && <Spinner className="mr-2" size="sm" />}
								{plan.items.length === 0
									? 'Nothing to import'
									: `Import ${plural(plan.items.length, 'transaction')}`}
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</SectionCard>
	);
}

export default ImportDataCard;
