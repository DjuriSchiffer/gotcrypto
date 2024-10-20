import React from 'react';
import Page from './Page';
import LoadingIndicator from './LoadingIndicator';

interface LoadingErrorWrapperProps {
  storageIsLoading: boolean;
  fetchedIsLoading: boolean;
  isError: boolean;
  children: React.ReactNode;
}

const LoadingErrorWrapper: React.FC<LoadingErrorWrapperProps> = ({
  storageIsLoading,
  fetchedIsLoading,
  isError,
  children,
}) => {
  if (storageIsLoading) {
    return (
      <Page>
        <LoadingIndicator message="Loading saved data..." />
      </Page>
    );
  }

  if (fetchedIsLoading) {
    return (
      <Page>
        <LoadingIndicator message="Fetching data from CoinMarketCap..." />
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <LoadingIndicator message="Could not fetch data from CoinMarketCap." />
      </Page>
    );
  }

  return <>{children}</>;
};

export default LoadingErrorWrapper;
