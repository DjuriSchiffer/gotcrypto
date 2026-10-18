import type { SelectedAsset } from 'currency';

export const SUPPORT_PROMPT_MIN_TRANSACTIONS = 5;
export const SUPPORT_PROMPT_SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

const STORAGE_KEY = 'gotcrypto.supportPrompt';

/** When the prompt may show again: a timestamp, or 'never' once supported or turned off. */
export type SupportPromptState = { hiddenUntil: 'never' | number } | null;

export const countTransactions = (assets: ReadonlyArray<SelectedAsset>): number =>
	assets.reduce((sum, asset) => sum + asset.transactions.length, 0);

export const shouldShowSupportPrompt = ({
	isAdmin,
	now,
	state,
	transactionCount,
}: {
	isAdmin: boolean;
	now: number;
	state: SupportPromptState;
	transactionCount: number;
}): boolean => {
	if (isAdmin || transactionCount < SUPPORT_PROMPT_MIN_TRANSACTIONS) return false;
	if (!state) return true;
	return state.hiddenUntil !== 'never' && now >= state.hiddenUntil;
};

export const readSupportPromptState = (): SupportPromptState => {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed === 'object' && parsed !== null && 'hiddenUntil' in parsed) {
			const { hiddenUntil } = parsed;
			if (hiddenUntil === 'never' || typeof hiddenUntil === 'number') return { hiddenUntil };
		}
		return null;
	} catch {
		return null;
	}
};

export const saveSupportPromptState = (state: NonNullable<SupportPromptState>): void => {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Blocked storage: the prompt may show again next time, which is fine
	}
};
