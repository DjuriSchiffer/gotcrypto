import {
  FaArrowUp,
  FaArrowDown,
  FaPen,
  FaTrashAlt,
  FaPlus,
} from "react-icons/fa";

const Icon = ({ color, id }) => {
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

    default:
      return null;
  }
};

export default Icon;
