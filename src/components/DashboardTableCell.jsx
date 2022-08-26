import classNames from 'classnames';

const DashboardTableCell = ({children, align = "left", position}) => {
    return (
        <td className={classNames('py-2 border-white', {
            'text-right' : align !== 'left',
            'flex' : position === 'last',
            'items-center' : position === 'last',
            'justify-end' : position === 'last',
            'pr-2' : position === 'last',
            'pl-2' : position === 'first'
        })} >{children}</td>
    )
}

export default DashboardTableCell;