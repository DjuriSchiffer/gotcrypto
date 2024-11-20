import React, { ReactNode, useState } from 'react';
import SideBar from './SideBar';
import { FaArrowLeft, FaBars, FaTimes } from 'react-icons/fa';
import classNames from 'classnames';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <button
        onClick={toggleSidebar}
        className={classNames(
          'fixed top-4 right-4 z-20 p-2',
          'bg-white dark:bg-gray-800',
          'rounded-md shadow-sm',
          'lg:hidden'
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <FaTimes size={32} color="white" /> : <FaBars size={32} color="white" />}
      </button>
      <div className="p-4">
        <div className="grid gap-4 w-full grid-cols-6">
          <div className={classNames(
            'fixed col-span-6 lg:col-span-1 z-10',
            'top-0 bottom-0',
            'transition-all duration-300',
            {
              'left-0 right-0': isOpen,
              '-left-full right-full': !isOpen,
            },
            'lg:static lg:left-auto lg:right-auto lg:z-auto'
          )}>
            <SideBar />
          </div>
          <div className='col-span-6 lg:col-span-5 lg:ml-6'>{children}</div>
        </div>
      </div>
    </main>
  );
};

export default Page;
