import { Spinner } from 'flowbite-react';

type LoadingIndicatorProps = {
  color?: 'failure' | 'info' | 'success' | 'warning';
  message?: string;
}

function LoadingIndicator({
  color = 'success',
  message = 'Loading...',
}: LoadingIndicatorProps) {
  return (
    <div
      className="text-white flex items-center justify-center w-full min-h-screen"
    >
      <Spinner aria-label="Loading" color={color} />
      <span className="ml-2">{message}</span>
    </div>
  )
};

export default LoadingIndicator;
