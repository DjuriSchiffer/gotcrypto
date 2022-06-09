import { Link } from "react-router-dom";

const LinkButton = ({to = null, children}) => {

    return (
        <Link to={to}>
            {children}
        </Link>
    );
};

export default LinkButton;