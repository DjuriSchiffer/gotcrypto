import { useState } from "../hooks/useReducer";
import Modal from "./Modal";
import { Button } from "flowbite-react";
import Icon from "./Icon";

const Error = () => {
  const { error } = useState();

  const handleError = () => {
    window.location.reload(false);
  };

  return (
    <Modal
      title={"Oops, an error has occurred"}
      open={error}
      onClose={() => handleError()}
    >
      <Icon id="Warning" color="white" className="flex mx-auto mb-4 text-6xl" />
      <div className="flex justify-center">
        <Button color={"failure"} onClick={() => handleError()}>
          Reload page
        </Button>
      </div>
    </Modal>
  );
};

export default Error;
