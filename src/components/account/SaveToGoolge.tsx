import type { OAuthCredential } from 'firebase/auth';

import { Alert, Button, Spinner } from 'flowbite-react';
import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { useAuth } from '../../hooks/useAuth';
import { useStorage } from '../../hooks/useStorage';
import {
	copyLocalPortfolio,
	signInToExistingAccount,
	upgradeAnonymousAccount,
} from '../../services/accountUpgrade';
import { auth } from '../../firebase/firebaseConfig';
import Modal from '../Modal';

type State =
	| { credential: OAuthCredential; email: null | string; status: 'account-exists' }
	| { message: string; status: 'error' }
	| { status: 'copy-failed' }
	| { status: 'idle' }
	| { status: 'working' };

/**
 * Lets an anonymous user move their portfolio to a Google account, without ever
 * overwriting or merging into an account that already has data.
 */
function SaveToGoogle() {
	const { refreshAuth } = useAuth();
	const { reload } = useStorage();
	const [state, setState] = useState<State>({ status: 'idle' });

	const handleSave = async () => {
		setState({ status: 'working' });
		const result = await upgradeAnonymousAccount();

		switch (result.status) {
			case 'linked':
				// Only now switch the app to the Google account: its portfolio is in place
				refreshAuth();
				break;
			case 'cancelled':
				setState({ status: 'idle' });
				break;
			default:
				setState(result);
		}
	};

	const handleRetryCopy = async () => {
		const uid = auth.currentUser?.uid;
		if (!uid) return;

		setState({ status: 'working' });
		try {
			await copyLocalPortfolio(uid);
			refreshAuth();
		} catch (error) {
			console.error('Copying the portfolio failed again:', error);
			setState({ status: 'copy-failed' });
		}
	};

	const handleUseExisting = async () => {
		if (state.status !== 'account-exists') return;

		const { credential } = state;
		setState({ status: 'working' });
		try {
			const plan = await signInToExistingAccount(credential);
			// The app already loaded the account while the copy ran; show what was copied
			if (plan?.kind === 'write') {
				reload();
			}
		} catch (error) {
			console.error('Signing in to the existing account failed:', error);
			setState({
				message: "Couldn't sign in to that account. You're still in your anonymous session.",
				status: 'error',
			});
		}
	};

	const isWorking = state.status === 'working';
	const existingEmail = state.status === 'account-exists' ? state.email : null;

	return (
		<div className="flex flex-col gap-3">
			<Button
				className="w-fit"
				color="primary"
				disabled={isWorking || state.status === 'copy-failed'}
				onClick={() => void handleSave()}
			>
				{isWorking ? <Spinner className="mr-2" size="sm" /> : <FaGoogle className="mr-2" />}
				Save to a Google account
			</Button>

			{state.status === 'error' && <Alert color="failure">{state.message}</Alert>}

			{state.status === 'copy-failed' && (
				<Alert color="warning">
					<div className="flex flex-col gap-2">
						<span>
							Your Google account is connected, but copying your portfolio didn't work. Your data is
							still safe in this browser.
						</span>
						<Button className="w-fit" color="gray" onClick={() => void handleRetryCopy()} size="xs">
							Try again
						</Button>
					</div>
				</Alert>
			)}

			<Modal
				onClose={() => setState({ status: 'idle' })}
				open={state.status === 'account-exists'}
				size="lg"
				title="This Google account is already in use"
			>
				<div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300">
					<p>
						<strong className="text-gray-900 dark:text-white">
							{existingEmail ?? 'This account'}
						</strong>{' '}
						already has a Got Crypto account.
					</p>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							<strong className="text-gray-900 dark:text-white">Sign in to that account.</strong> If
							its portfolio is empty, this session's portfolio moves into it. If it already has a
							portfolio, nothing is copied or merged: you'll see its own portfolio, and this
							session's data stays in this browser, untouched.
						</li>
						<li>
							<strong className="text-gray-900 dark:text-white">Stay anonymous</strong> to keep
							working as you are. You can choose a different Google account next time.
						</li>
					</ul>
				</div>
				<div className="flex justify-end gap-2">
					<Button color="gray" onClick={() => setState({ status: 'idle' })}>
						Stay anonymous
					</Button>
					<Button color="primary" onClick={() => void handleUseExisting()}>
						Sign in to that account
					</Button>
				</div>
			</Modal>
		</div>
	);
}

export default SaveToGoogle;
