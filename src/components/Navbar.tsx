import React from 'react';
import { Button, Navbar, Tooltip } from 'flowbite-react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import logo from '../public/images/logo.svg';

const Nav: React.FC = () => {
  return (
    <Navbar fluid rounded>
      <Link
        to="/"
        className="mr-auto flex flex-wrap items-center justify-between"
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
            color="gray"
            rel="noreferrer"
          >
            <Icon id="Github" color="white" />
          </Button>
        </Tooltip>
      </div>
    </Navbar>
  );
};

export default Nav;
