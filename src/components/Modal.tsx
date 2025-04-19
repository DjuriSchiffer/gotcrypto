import type { ReactNode } from 'react';

import { Modal, ModalBody, ModalHeader } from 'flowbite-react';

type ModalComponentProps = {
	children: ReactNode;
	onClose: () => void;
	open?: boolean;
	title?: string;
};

function ModalComponent({ children, onClose, open = false, title = 'Modal' }: ModalComponentProps) {
	return (
		<Modal onClose={onClose} show={open}>
			<ModalHeader>{title}</ModalHeader>
			<ModalBody>
				<div className="space-y-6">{children}</div>
			</ModalBody>
		</Modal>
	);
}

export default ModalComponent;
