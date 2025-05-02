import { Spinner } from 'flowbite-react';

type LoadingIndicatorProps = {
	color?: 'failure' | 'info' | 'success' | 'warning';
	message?: string;
};

function LoadingIndicator({ color = 'success', message = 'Loading...' }: LoadingIndicatorProps) {
	return (
		<div className="flex min-h-screen w-full items-center justify-center text-dark dark:text-white">
			<Spinner aria-label="Loading" color={color} />
			<span className="ml-2">{message}</span>
		</div>
	);
}

export default LoadingIndicator;
