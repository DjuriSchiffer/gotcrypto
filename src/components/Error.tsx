import { Button } from 'flowbite-react';
import { FaRedo } from 'react-icons/fa';

import { useAppState } from '../hooks/useAppState';
import Modal from './Modal';
import ErrorState from './ui/ErrorState';

const reload = (): void => {
	window.location.reload();
};

/** Shown when loading or saving stored data fails (the SET_ERROR action). */
function Error() {
	const { error } = useAppState();

	return (
		<Modal onClose={reload} open={error} size="md" title="Something went wrong">
			<ErrorState
				actions={
					<Button color="primary" onClick={reload}>
						<FaRedo className="mr-2 h-3 w-3" />
						Reload page
					</Button>
				}
				message="Your data couldn't be loaded or saved. Reloading the page usually fixes this."
				title="Your data couldn't be reached"
			/>
		</Modal>
	);
}

export default Error;
