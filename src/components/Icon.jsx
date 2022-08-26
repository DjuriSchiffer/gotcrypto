import { FaArrowUp, FaArrowDown, FaPen, FaTrashAlt } from "react-icons/fa";

const Icon = ({color, id}) => {
    switch (id) {
        case "Up":
          return <FaArrowUp color={color} />;
          
        case "Down":
        return <FaArrowDown color={color} />;

        case "Edit":
          return <FaPen color={color} />;

        case "Remove": 
        return <FaTrashAlt color={color} />

        default:
        return null;
        }

}

export default Icon;