import { Button } from 'flowbite-react';
import { FaExclamationTriangle } from 'react-icons/fa';

import { useAppState } from '../hooks/useAppState';
import Modal from './Modal';

function Error() {
  const { error } = useAppState();

  /**
   * Handles the error by reloading the page.
   */
  const handleError = (): void => {
    window.location.reload();
  };

  return (
    <Modal
      onClose={handleError}
      open={error}
      title="Oops, an error has occurred"
    >
      <FaExclamationTriangle className="flex mx-auto mb-4 text-6xl" color="white" />
      <div className="flex justify-center">
        <Button color="failure" onClick={handleError}>
          Reload page
        </Button>
      </div>
    </Modal>
  );
};

export default Error;
