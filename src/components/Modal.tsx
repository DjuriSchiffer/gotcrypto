import type { ComponentProps, ReactNode } from 'react';

import { Modal, ModalBody, ModalHeader } from 'flowbite-react';

type ModalComponentProps = {
	children: ReactNode;
	onClose: () => void;
	open?: boolean;
	title?: string;
	size?: ComponentProps<typeof Modal>['size'];
};

function ModalComponent({
	children,
	onClose,
	open = false,
	title = 'Modal',
	size = 'xl',
}: ModalComponentProps) {
	return (
		<Modal onClose={onClose} show={open} size={size}>
			<ModalHeader>{title}</ModalHeader>
			<ModalBody>
				<div className="space-y-6">{children}</div>
			</ModalBody>
		</Modal>
	);
}

export default ModalComponent;
