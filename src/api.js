import axios from "axios";

export const getCurrencies = async () => {
  return await axios
    .get(`${import.meta.env.VITE_REACT_APP_HOST}/wp-json/prices/v2/post/`)
    .then(({ data }) => data);
};
