import type { ComponentProps, ReactNode } from 'react';

import { Modal, ModalBody, ModalHeader } from 'flowbite-react';

type ModalComponentProps = {
	children: ReactNode;
	onClose: () => void;
	open?: boolean;
	size?: ComponentProps<typeof Modal>['size'];
	title?: string;
};

function ModalComponent({
	children,
	onClose,
	open = false,
	size = 'xl',
	title = 'Modal',
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
