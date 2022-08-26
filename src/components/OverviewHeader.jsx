const OverviewHeader = ({onSubmit, children, className}) => {
    return (
        <form onSubmit={onSubmit} className={className} >
            {children}
        </form>
    )
};

export default OverviewHeader;