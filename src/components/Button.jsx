import { Link } from "react-router-dom";

const Button = ({
  id = "action",
  children,
  onClick,
  to,
  className,
  text = "",
}) => {
  if (id === "action") {
    return (
      <button className={className} onClick={onClick}>
        {text && <span className="mr-1">{text}</span>}
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
