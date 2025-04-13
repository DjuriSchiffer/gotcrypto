import LoadingIndicator from './LoadingIndicator';
import Page from './Page';

type LoadingErrorWrapperProps = {
	children: React.ReactNode;
	fetchedIsLoading: boolean;
	isError: boolean;
	storageIsLoading: boolean;
};

function LoadingErrorWrapper({
	children,
	fetchedIsLoading,
	isError,
	storageIsLoading,
}: LoadingErrorWrapperProps) {
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
}

export default LoadingErrorWrapper;
