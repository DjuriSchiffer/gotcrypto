const Button = ({onClick, children}) => {
    return (
        <button className="bg-red p-2 rounded-md shadow text-white" onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
