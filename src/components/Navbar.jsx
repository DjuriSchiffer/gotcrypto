import { Button, Navbar, Tooltip } from "flowbite-react";
import logo from "../public/images/logo.svg";
import { Link } from "react-router-dom";
import Icon from "./Icon";

const Nav = () => {
  return (
    <Navbar fluid={true} rounded={true}>
      <Link
        to={"/"}
        className={"mr-auto flex flex-wrap items-center justify-between"}
      >
        <img src={logo} className="mr-3 h-6 sm:h-9" alt="Got Crypto" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Got Crypto
        </span>
      </Link>
      <div className="flex md:order-2">
        <Tooltip content="Github">
          <Button
            href="https://github.com/DjuriSchiffer/gotcrypto"
            color={"gray"}
            target={"_blank"}
            rel={"noreferer"}
          >
            <Icon id="Github" />
          </Button>
        </Tooltip>
      </div>
    </Navbar>
  );
};

export default Nav;
