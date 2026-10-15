import { FaClock } from 'react-icons/fa';

type StalePricesNoteProps = {
	stale: boolean;
	updatedAt: Date | null;
};

const formatUpdatedAt = (date: Date): string =>
	date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** Says so when prices couldn't be refreshed and older ones are shown. Renders nothing otherwise. */
function StalePricesNote({ stale, updatedAt }: StalePricesNoteProps) {
	if (!stale) return null;

	return (
		<p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400" role="status">
			<FaClock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
			{updatedAt
				? `Prices couldn't be refreshed. Showing prices from ${formatUpdatedAt(updatedAt)}.`
				: "Prices couldn't be refreshed. Showing the last known prices."}
		</p>
	);
}

export default StalePricesNote;
