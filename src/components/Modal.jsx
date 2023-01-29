import { Modal as FBModal } from "flowbite-react";

const Modal = ({ title = "Modal", children, open = false, onClose }) => {
  return (
    <FBModal show={open} onClose={onClose}>
      <FBModal.Header>{title}</FBModal.Header>
      <FBModal.Body>
        <div className="space-y-6">{children}</div>
      </FBModal.Body>
    </FBModal>
  );
};

export default Modal;
