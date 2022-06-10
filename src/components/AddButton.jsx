const AddButton = ({onClick, children}) => {
    return (
        <button onClick={onClick}>
            {children}
        </button>
    );
};

export default AddButton;
