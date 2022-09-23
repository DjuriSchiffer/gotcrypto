import {
  FaArrowUp,
  FaArrowDown,
  FaPen,
  FaTrashAlt,
  FaPlus,
  FaExclamationTriangle,
  FaUndoAlt,
} from "react-icons/fa";

const Icon = ({ color, id, className }) => {
  switch (id) {
    case "Up":
      return <FaArrowUp color={color} />;

    case "Down":
      return <FaArrowDown color={color} />;

    case "Edit":
      return <FaPen color={color} />;

    case "Remove":
      return <FaTrashAlt color={color} />;

    case "Plus":
      return <FaPlus color={color} />;

    case "Close":
      return <FaPlus color={color} className={"rotate-45"} />;

    case "Warning":
      return <FaExclamationTriangle color={color} className={className} />;

    case "Reload":
      return <FaUndoAlt color={color} className={className} />;

    default:
      return null;
  }
};

export default Icon;
