import { beforeEach, describe, expect, it } from 'vitest';

import {
	readSupportPromptState,
	saveSupportPromptState,
	shouldShowSupportPrompt,
	SUPPORT_PROMPT_MIN_TRANSACTIONS,
} from './supportPrompt';

const NOW = 1_700_000_000_000;
const base = { isAdmin: false, now: NOW, state: null, transactionCount: SUPPORT_PROMPT_MIN_TRANSACTIONS };

describe('shouldShowSupportPrompt', () => {
	it('shows once someone has entered enough transactions', () => {
		expect(shouldShowSupportPrompt(base)).toBe(true);
		expect(
			shouldShowSupportPrompt({ ...base, transactionCount: SUPPORT_PROMPT_MIN_TRANSACTIONS - 1 })
		).toBe(false);
	});

	it('never shows to admins', () => {
		expect(shouldShowSupportPrompt({ ...base, isAdmin: true })).toBe(false);
	});

	it('stays hidden after supporting or turning it off', () => {
		expect(shouldShowSupportPrompt({ ...base, state: { hiddenUntil: 'never' } })).toBe(false);
	});

	it('comes back after "Maybe later" has passed', () => {
		expect(shouldShowSupportPrompt({ ...base, state: { hiddenUntil: NOW + 1 } })).toBe(false);
		expect(shouldShowSupportPrompt({ ...base, state: { hiddenUntil: NOW } })).toBe(true);
	});
});

describe('support prompt storage', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	it('remembers the choice in this browser', () => {
		expect(readSupportPromptState()).toBeNull();
		saveSupportPromptState({ hiddenUntil: 'never' });
		expect(readSupportPromptState()).toEqual({ hiddenUntil: 'never' });
	});

	it('ignores anything it does not recognise', () => {
		window.localStorage.setItem('gotcrypto.supportPrompt', '{"hiddenUntil":"soon"}');
		expect(readSupportPromptState()).toBeNull();
		window.localStorage.setItem('gotcrypto.supportPrompt', 'not json');
		expect(readSupportPromptState()).toBeNull();
	});
});
