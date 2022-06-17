import { Link } from "react-router-dom";

const LinkButton = ({to = null, children}) => {
    return (
        <Link className="bg-green-800 p-2 rounded-md shadow text-white" to={to}>
            {children}
        </Link>
    );
};

export default LinkButton;