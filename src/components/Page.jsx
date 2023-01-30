import { Button, Navbar } from "flowbite-react";
import logo from "../public/images/logo.svg";
import { Link } from "react-router-dom";
import Icon from "./Icon";

const Page = ({ children }) => {
  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
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
          <Button color={"gray"}>
            <Icon id="Github" />
          </Button>
        </div>
      </Navbar>
      <div className={"p-4"}>{children}</div>
    </main>
  );
};

export default Page;
