const TableBody= ({children, className}) => {
    return (
        <tbody className={className}>
            {children}
        </tbody>
    )
}

export default TableBody;