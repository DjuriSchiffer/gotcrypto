import classNames from "classnames";
import IconButton from "./Button";
import Icon from "../components/Icon";

const Modal = ({
  title = "Modal",
  children,
  open = false,
  onClose,
}) => {
  return (
    <div
      tabIndex="-1"
      className={classNames(
        "overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full bg-black-rgba",
        {
          flex: open,
          hidden: !open,
        }
      )}
    >
      <div className="relative bg-dark shadow-line rounded w-full  max-w-md h-full md:h-auto mx-auto my-auto">
        <div className="p-4 flex items-center justify-between shadow-line">
          <h2>{title}</h2>
          <IconButton id="action" onClick={() => onClose()}>
            <Icon id="Close" color="white" />
          </IconButton>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;