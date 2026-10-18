import { Button, Card } from 'flowbite-react';
import { useContext, useState } from 'react';
import { FaCoffee, FaTimes } from 'react-icons/fa';

import type { SupportPromptState } from '../../utils/supportPrompt';

import { KOFI_URL } from '../../config/support';
import { AuthContext } from '../../contexts/AuthContext';
import {
	readSupportPromptState,
	saveSupportPromptState,
	shouldShowSupportPrompt,
	SUPPORT_PROMPT_SNOOZE_MS,
} from '../../utils/supportPrompt';

type SupportPromptProps = { transactionCount: number };

function SupportPrompt({ transactionCount }: SupportPromptProps) {
	const auth = useContext(AuthContext);
	const [state, setState] = useState<SupportPromptState>(readSupportPromptState);

	const visible =
		auth !== undefined &&
		shouldShowSupportPrompt({ isAdmin: auth.isAdmin, now: Date.now(), state, transactionCount });
	if (!visible) return null;

	const hide = (hiddenUntil: 'never' | number) => {
		const next = { hiddenUntil };
		saveSupportPromptState(next);
		setState(next);
	};

	return (
		<Card>
			<div className="flex items-start gap-4">
				<FaCoffee aria-hidden className="mt-1 hidden h-6 w-6 shrink-0 text-amber-600 sm:block" />
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					<div>
						<h2 className="font-semibold text-gray-900 dark:text-white">Enjoying Got Crypto?</h2>
						<p className="text-sm text-gray-600 dark:text-gray-300">
							It&apos;s free, has no ads and is built by one developer in their spare time. If
							it&apos;s useful to you, a coffee helps pay for hosting and keeps it independent.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							as="a"
							color="primary"
							href={KOFI_URL}
							onClick={() => {
								hide('never');
							}}
							rel="noopener noreferrer"
							size="sm"
							target="_blank"
						>
							<FaCoffee aria-hidden className="mr-2" />
							Buy me a coffee
						</Button>
						<Button
							color="gray"
							onClick={() => {
								hide(Date.now() + SUPPORT_PROMPT_SNOOZE_MS);
							}}
							size="sm"
						>
							Maybe later
						</Button>
					</div>
				</div>
				<button
					aria-label="Don't show again"
					className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
					onClick={() => {
						hide('never');
					}}
					title="Don't show again"
					type="button"
				>
					<FaTimes aria-hidden />
				</button>
			</div>
		</Card>
	);
}

export default SupportPrompt;
