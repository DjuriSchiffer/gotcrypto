import { Alert, Button, Spinner } from 'flowbite-react';
import { useState } from 'react';
import { FaUserTimes } from 'react-icons/fa';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { deleteAccount } from '../../services/authService';
import { deleteAccountErrorMessage } from '../../utils/accountDeletion';
import ConfirmModal from '../ui/ConfirmModal';

const CONFIRM_WORD = 'DELETE';

/** "Delete account" in the danger zone: removes all data and the login itself. */
function DeleteAccount() {
	const { isAnonymous, user } = useAuth();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<null | string>(null);
	const { showSuccess } = useToast();

	const handleDelete = async () => {
		setConfirmOpen(false);
		setPending(true);
		setError(null);
		try {
			await deleteAccount();
			// Nobody is signed in now: the app switches to the sign-in screen by itself,
			// and this message stays visible there
			showSuccess('Your account and all its data have been deleted.');
		} catch (deleteError) {
			console.error('Failed to delete account:', deleteError);
			setError(deleteAccountErrorMessage(deleteError, user?.email ?? null));
			setPending(false);
		}
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="font-medium text-gray-900 dark:text-white">Delete account</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{isAnonymous
							? 'Removes your portfolio and preferences from this browser and ends this session.'
							: 'Removes your portfolio, preferences and login. You can always start over.'}
					</p>
				</div>
				<Button
					color="failure"
					disabled={pending}
					onClick={() => {
						setConfirmOpen(true);
					}}
				>
					{pending ? <Spinner className="mr-2" size="sm" /> : <FaUserTimes className="mr-2" />}
					Delete account
				</Button>
			</div>

			{error && <Alert color="failure">{error}</Alert>}

			<ConfirmModal
				confirmLabel="Delete account"
				message={
					isAnonymous ? (
						<>
							This permanently deletes your portfolio and preferences from this browser. Export your
							data first if you want to keep a copy. This can&apos;t be undone.
						</>
					) : (
						<>
							This permanently deletes your portfolio, your preferences and your login
							{user?.email ? (
								<>
									{' '}
									for <strong>{user.email}</strong>
								</>
							) : null}
							. You&apos;ll be asked to choose your Google account once more to confirm. Export your
							data first if you want to keep a copy. This can&apos;t be undone.
						</>
					)
				}
				onClose={() => {
					setConfirmOpen(false);
				}}
				onConfirm={() => void handleDelete()}
				open={confirmOpen}
				requireText={CONFIRM_WORD}
				title="Delete your account?"
			/>
		</div>
	);
}

export default DeleteAccount;
