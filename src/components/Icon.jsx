import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const Icon = ({color, id}) => {
    switch (id) {
        case "Up":
          return <FaArrowUp color={color} />;
          
        case "Down":
        return <FaArrowDown color={color} />;

        default:
        return null;
        }

}

export default Icon;