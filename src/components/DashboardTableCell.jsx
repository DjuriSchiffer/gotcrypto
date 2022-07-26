import classNames from 'classnames';

const DashboardTableCell = ({children, align = "left"}) => {
    return (
        <td className={classNames('p-2 border-white', {
            'text-right' : align !== 'left'
        })} >{children}</td>
    )
}

export default DashboardTableCell;