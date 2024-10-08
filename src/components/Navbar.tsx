import React, { useState } from 'react';
import { Button, Navbar, Tooltip } from 'flowbite-react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import logo from '../public/images/logo.svg';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import SignIn from './SignIn';

const Nav: React.FC = () => {
  const { user, isAnonymous } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
        {user && !isAnonymous && (
          <Tooltip content="SignOut">
            <Button onClick={handleSignOut} color="gray" rel="noreferrer">
              Sign Out
            </Button>
          </Tooltip>
        )}
        {user && isAnonymous && (
          <Tooltip content="SignIn">
            <SignIn />
          </Tooltip>
        )}
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
