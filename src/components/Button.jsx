const Button = ({onClick, children}) => {
    return (
        <button className="bg-rose-800 p-2 rounded-md shadow text-white" onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
