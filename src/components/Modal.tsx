import type { ReactNode } from 'react';

import { Modal, ModalBody, ModalHeader, type ModalSizes } from 'flowbite-react';
import type { DynamicStringEnumKeysOf } from 'flowbite-react/dist/types';

type ModalComponentProps = {
	children: ReactNode;
	onClose: () => void;
	open?: boolean;
	title?: string;
	size?: DynamicStringEnumKeysOf<ModalSizes>;
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
