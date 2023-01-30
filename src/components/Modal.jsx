import { Modal } from "flowbite-react";

const ModalComponent = ({
  title = "Modal",
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
