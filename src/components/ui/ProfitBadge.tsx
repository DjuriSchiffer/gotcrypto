import { Badge } from 'flowbite-react';

import { percentageFormat } from '../../utils/helpers';

type ProfitBadgeProps = {
	percentage: number;
};

function ProfitBadge({ percentage }: ProfitBadgeProps) {
	const color = percentage > 0 ? 'success' : percentage < 0 ? 'failure' : 'gray';
	const sign = percentage > 0 ? '+' : '';

	return (
		<Badge className="w-fit" color={color}>
			{sign}
			{percentageFormat(percentage)}
		</Badge>
	);
}

export default ProfitBadge;
