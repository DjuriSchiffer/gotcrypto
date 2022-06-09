import { useState } from "../hooks/useReducer";

const Error = () => {
    const { error } = useState();
    console.log(error);

    return (
        <div>
            <div>Error</div>
            <div>Something has happend</div>
        </div>
    );
};

export default Error;