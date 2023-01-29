import { Link } from "react-router-dom";

const Button = ({
  id = "action",
  children,
  onClick,
  to,
  className,
  text = "",
  type = "",
  disabled = false,
}) => {
  if (id === "action") {
    return (
      <button
        disabled={disabled}
        className={
          "text-white bg-blue-700 hover:bg-blue-800 border border-transparent  focus:ring-4 focus:ring-blue-300 disabled:hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:disabled:hover:bg-blue-600 focus:!ring-2 group flex h-min items-center justify-center p-0.5 text-center font-medium focus:z-10 rounded-lg ml-2 disabled:cursor-not-allowed"
        }
        onClick={onClick}
      >
        {text && (
          <span className="flex items-center rounded-md text-sm px-4 py-2">
            {text}
          </span>
        )}
        {children}
      </button>
    );
  }
  if (id === "link") {
    return (
      <Link className={className} to={to}>
        {text && <span className="mr-1">{text}</span>}
        {children}
      </Link>
    );
  }
};

export default Button;
