import { useState } from "../hooks/useReducer";
import Modal from "./Modal";
import IconButton from "./Button";
import Icon from "./Icon";

const Error = () => {
  const { error } = useState();

  const handleError = () => {
    window.location.reload(false);
  };

  return (
    <Modal title={"Error"} open={error} onClose={() => handleError()}>
      <Icon id="Warning" color="white" className="flex mx-auto mb-4 text-6xl" />
      <IconButton
        id="action"
        onClick={() => handleError()}
        text="Reload page"
        className={"p-2 rounded-md text-white flex items-center bg-red mx-auto"}
      ></IconButton>
    </Modal>
  );
};

export default Error;
