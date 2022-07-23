
const IconButton = ({children, onClick}) => {    
    return (
        <button className="p-2 rounded-md text-black" onClick={onClick}>
            {children}
        </button>
    );
};

export default IconButton;