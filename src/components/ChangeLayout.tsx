import { Button } from "flowbite-react";
import { useStorage } from "../hooks/useStorage";
import { useMemo } from "react";
import classNames from "classnames";
import { DashboardLayout } from "store";
import { FaTh, FaThList } from 'react-icons/fa';

interface LayoutOption {
    label: DashboardLayout;
    symbol: React.ReactNode;
}

export function ChangeLayout() {
    const { setDashboardLayout, dashboardLayout } = useStorage();

    const handleLayoutChange = (layout: DashboardLayout) => {
        setDashboardLayout(layout);
    };

    const layoutOptions: LayoutOption[] = useMemo(() => [
        {
            label: 'Grid',
            symbol: <FaTh className="mr-1" />,
        },
        {
            label: 'Table',
            symbol: <FaThList className="mr-1" />,
        },
    ], []);

    return (
        <Button.Group>
            {layoutOptions.map((option, index) => (
                <Button
                    key={option.label}
                    title={option.label}
                    color={dashboardLayout === option.label ? 'dark' : 'gray'}
                    onClick={() => handleLayoutChange(option.label)}
                    className={classNames('', {
                        '!border-blue-400': dashboardLayout === option.label,
                        'border-l': index > 0 && dashboardLayout === option.label,
                        '!border-l-[1px]': index > 0 && dashboardLayout === option.label,
                    })}
                >
                    {option.symbol}
                    {option.label}
                </Button>
            ))}
        </Button.Group>
    );
}