import type { ReactNode } from 'react';

import { Button, TextInput } from 'flowbite-react';
import { useEffect, useId, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

import Modal from '../Modal';

type ConfirmModalProps = {
	confirmLabel: string;
	message: ReactNode;
	onClose: () => void;
	onConfirm: () => void;
	open: boolean;
	/** For irreversible actions: the user must type this word before confirming */
	requireText?: string;
	title: string;
};

/** Asks the user to confirm a destructive action. */
function ConfirmModal({
	confirmLabel,
	message,
	onClose,
	onConfirm,
	open,
	requireText,
	title,
}: ConfirmModalProps) {
	const [typed, setTyped] = useState('');
	const inputId = useId();

	// Start empty every time the modal opens
	useEffect(() => {
		if (open) setTyped('');
	}, [open]);

	const canConfirm = !requireText || typed.trim() === requireText;

	return (
		<Modal onClose={onClose} open={open} size="md" title={title}>
			<div className="flex gap-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
					<FaExclamationTriangle aria-hidden className="text-red-600 dark:text-red-400" />
				</div>
				<div className="text-sm text-gray-600 dark:text-gray-300">{message}</div>
			</div>

			{requireText && (
				<div className="flex flex-col gap-2">
					<label className="text-sm text-gray-700 dark:text-gray-300" htmlFor={inputId}>
						Type <strong className="font-mono">{requireText}</strong> to confirm
					</label>
					<TextInput
						autoComplete="off"
						id={inputId}
						onChange={(event) => { setTyped(event.target.value); }}
						value={typed}
					/>
				</div>
			)}

			<div className="flex justify-end gap-2">
				<Button color="gray" onClick={onClose}>
					Cancel
				</Button>
				<Button color="failure" disabled={!canConfirm} onClick={onConfirm}>
					{confirmLabel}
				</Button>
			</div>
		</Modal>
	);
}

export default ConfirmModal;
