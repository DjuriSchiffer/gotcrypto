import classNames from 'classnames';

const DashboardTableCell = ({children, align = "left"}) => {
    return (
        <td className={classNames('py-2', {
            'text-right' : align !== 'left'
        })} >{children}</td>
    )
}

export default DashboardTableCell;