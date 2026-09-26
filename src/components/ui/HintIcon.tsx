import { Tooltip } from 'flowbite-react';
import { FaInfoCircle } from 'react-icons/fa';

type HintIconProps = {
	hint: string;
};

function HintIcon({ hint }: HintIconProps) {
	return (
		<Tooltip content={hint}>
			<FaInfoCircle aria-label={hint} className="h-3.5 w-3.5 cursor-help text-gray-400" />
		</Tooltip>
	);
}

export default HintIcon;
