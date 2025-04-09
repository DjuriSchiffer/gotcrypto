import type { ReactNode } from 'react';

import { Modal } from 'flowbite-react';

type ModalComponentProps = {
  children: ReactNode;
  onClose: () => void;
  open?: boolean;
  title?: string;
}

function ModalComponent({
  children,
  onClose,
  open = false,
  title = 'Modal',
}: ModalComponentProps) {
  return (
    <Modal onClose={onClose} show={open}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">{children}</div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalComponent;
