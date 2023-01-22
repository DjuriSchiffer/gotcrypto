import localForage from "localforage";
import { useDispatch } from "../hooks/useReducer";

export const useLocalForage = () => {
  const dispatch = useDispatch();

  /** Init localForage */
  const initLocalForage = (key) => {
    localForage
      .getItem(key)
      .then((values) => {
        if (values === null) {
          setLocalForage(key, []);
        } else {
          setLocalForage(key, values);
        }
      })
      .catch(function (err) {
        // This code runs if there were any errors
        dispatch({
          type: "SET_ERROR",
          payload: err,
        });
      });
  };

  /** Set value */
  const setLocalForage = (key, value, callback) => {
    localForage
      .setItem(key, value)
      .then((data) => {
        dispatch({
          type: "SET_SELECTED_CURRENCIES",
          payload: data,
        });
        if (typeof callback === "function") {
          return callback();
        }
      })
      .catch(function (err) {
        // This code runs if there were any errors
        dispatch({
          type: "SET_ERROR",
          payload: err,
        });
      });
  };

  return [setLocalForage, initLocalForage];
};
