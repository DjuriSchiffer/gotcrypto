const OverviewHeader = ({onSubmit, children}) => {
    return (
        <form onSubmit={onSubmit}>
            {children}
        </form>
    )
};

export default OverviewHeader;