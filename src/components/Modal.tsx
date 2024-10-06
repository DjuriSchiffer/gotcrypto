import React, { ReactNode } from 'react';
import { Modal } from 'flowbite-react';

interface ModalComponentProps {
  title?: string;
  children: ReactNode;
  open?: boolean;
  onClose: () => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  title = 'Modal',
  children,
  open = false,
  onClose,
}) => {
  return (
    <Modal show={open} onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">{children}</div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalComponent;
