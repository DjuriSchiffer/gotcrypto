import LoadingIndicator from './LoadingIndicator';
import Page from './Page';

type LoadingErrorWrapperProps = {
	children: React.ReactNode;
	fetchedIsLoading: boolean;
	isError: boolean;
};

function LoadingErrorWrapper({ children, fetchedIsLoading, isError }: LoadingErrorWrapperProps) {
	if (fetchedIsLoading) {
		return (
			<Page>
				<LoadingIndicator message="Loading your portfolio..." />
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
