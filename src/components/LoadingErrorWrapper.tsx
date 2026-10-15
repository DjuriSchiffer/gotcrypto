import type { ReactNode } from 'react';

import { Button, Card } from 'flowbite-react';
import { FaRedo } from 'react-icons/fa';

import Page from './layout/Page';
import LoadingIndicator from './LoadingIndicator';
import ErrorState from './ui/ErrorState';

type LoadingErrorWrapperProps = {
	children: ReactNode;
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
				<Card>
					<ErrorState
						actions={
							<Button
								color="primary"
								onClick={() => {
									window.location.reload();
								}}
							>
								<FaRedo className="mr-2 h-3 w-3" />
								Try again
							</Button>
						}
						message="CoinMarketCap can't be reached right now. Your portfolio is safe. Please try again in a minute."
						title="Prices couldn't be loaded"
					/>
				</Card>
			</Page>
		);
	}

	return <>{children}</>;
}

export default LoadingErrorWrapper;
