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
      return <FaArrowUp color={color} />;

    case "Down":
      return <FaArrowDown color={color} />;

    case "Left":
      return <FaArrowLeft color={color} className={className} />;

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
    
      case "Github":
        return <FaGithub color={color} className={className} />;

    default:
      return null;
  }
};

export default Icon;
