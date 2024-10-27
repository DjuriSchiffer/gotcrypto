import React from 'react';
import { Spinner } from 'flowbite-react';

interface LoadingIndicatorProps {
  message?: string;
  color?: 'success' | 'failure' | 'warning' | 'info';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  color = 'success',
}) => (
  <div
    className="text-white flex items-center justify-center w-full min-h-screen"
  >
    <Spinner color={color} aria-label="Loading" />
    <span className="ml-2">{message}</span>
  </div>
);

export default LoadingIndicator;
