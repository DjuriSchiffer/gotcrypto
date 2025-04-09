import type { ReactNode } from 'react';

import classNames from 'classnames';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

import SideBar from './SideBar';

type PageProps = {
  children: ReactNode;
}

function Page({ children }: PageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => { setIsOpen(!isOpen); };

  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <button
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className={classNames(
          'fixed top-4 right-4 z-20 p-2',
          'bg-white dark:bg-gray-800',
          'rounded-md shadow-sm',
          'lg:hidden'
        )}
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes color="white" size={32} /> : <FaBars color="white" size={32} />}
      </button>
      <div className="p-4">
        <div className="grid gap-4 w-full grid-cols-6">
          <div className={classNames(
            'fixed col-span-6 lg:col-span-1 z-10',
            'top-0 bottom-0',
            'transition-all duration-300',
            {
              '-left-full right-full': !isOpen,
              'left-0 right-0': isOpen,
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
