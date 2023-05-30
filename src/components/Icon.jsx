import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaPen,
  FaTrashAlt,
  FaPlus,
  FaExclamationTriangle,
  FaUndoAlt,
  FaGithub,
} from "react-icons/fa";

const Icon = ({ color, id, className }) => {
  switch (id) {
    case "Up":
      return <FaArrowUp color={color} className={className} />;

    case "Down":
      return <FaArrowDown color={color} className={className} />;

    case "Left":
      return <FaArrowLeft color={color} className={className} />;

    case "Edit":
      return <FaPen color={color} className={className} />;

    case "Remove":
      return <FaTrashAlt color={color} className={className} />;

    case "Plus":
      return <FaPlus color={color} className={className} />;

    case "Close":
      return <FaPlus color={color} className={"rotate-45"} />;

    case "Warning":
      return <FaExclamationTriangle color={color} className={className} />;

    case "Reload":
      return <FaUndoAlt color={color} className={className} />;

    case "Github":
      return <FaGithub color={color} className={className} />;

    default:
      return null;
  }
};

export default Icon;
