import React from 'react';
import { useAppState } from '../hooks/useAppState';
import Modal from './Modal';
import { Button } from 'flowbite-react';
import { FaExclamationTriangle } from 'react-icons/fa';

const Error: React.FC = () => {
  const { error } = useAppState();

  /**
   * Handles the error by reloading the page.
   */
  const handleError = (): void => {
    window.location.reload();
  };

  return (
    <Modal
      title="Oops, an error has occurred"
      open={error}
      onClose={handleError}
    >
      <FaExclamationTriangle color="white" className="flex mx-auto mb-4 text-6xl" />;
      <div className="flex justify-center">
        <Button color="failure" onClick={handleError}>
          Reload page
        </Button>
      </div>
    </Modal>
  );
};

export default Error;
