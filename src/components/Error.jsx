import { useState } from "../hooks/useReducer";

const Error = () => {
    const { error } = useState();

    return (
        <div className={`${error ? 'block' : 'hidden'} container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10`}>
            <div>Error</div>
            <div>Something has happend</div>
        </div>
    );
};

export default Error;