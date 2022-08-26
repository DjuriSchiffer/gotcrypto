import { Link } from "react-router-dom";

const IconButton = ({id = "action", children, onClick, to}) => {    
    if(id === 'action'){
        return (
            <button className="p-2 rounded-md text-black" onClick={onClick}>
                {children}
            </button>
        );
    }
    if(id === 'link'){
        return (
            <Link className="p-2 rounded-md text-black inline-block" to={to}>
                {children}
            </Link>
        );
    }
};

export default IconButton;