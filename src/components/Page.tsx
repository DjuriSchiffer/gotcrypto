import React, { ReactNode } from 'react';
import { useAppState } from '../hooks/useAppState';
import Navbar from './Navbar';
import classNames from 'classnames';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  const { fetchedCurrencies } = useAppState();

  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <Navbar />
      <div
        className={classNames('p-4 min-h-[calc(100vh_-_56px)]', {
          'justify-center items-center flex': !fetchedCurrencies,
        })}
      >
        {children}
      </div>
    </main>
  );
};

export default Page;
