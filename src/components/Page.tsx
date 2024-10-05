// src/components/Page.tsx

import React, { ReactNode } from 'react';
import { useAppState } from '../hooks/useReducer';
import Navbar from './Navbar';
import classNames from 'classnames';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  const { currencies } = useAppState();

  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <Navbar />
      <div
        className={classNames('p-4 min-h-[calc(100vh_-_56px)]', {
          'justify-center items-center flex': !currencies,
        })}
      >
        {children}
      </div>
    </main>
  );
};

export default Page;
