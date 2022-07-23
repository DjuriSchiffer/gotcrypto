import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const Icon = ({id}) => {
    switch (id) {
        case "Up":
          return <FaArrowUp />;
          
        case "Down":
        return <FaArrowDown />;

        default:
        return null;
        }

}

export default Icon;