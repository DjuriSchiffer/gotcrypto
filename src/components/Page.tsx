import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import classNames from 'classnames';
import useCoinMarketCap from '../hooks/useCoinMarketCap';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  const { data } = useCoinMarketCap();

  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <Navbar />
      <div
        className={classNames('p-4 min-h-[calc(100vh_-_56px)]', {
          'justify-center items-center flex': !data,
        })}
      >
        {children}
      </div>
    </main>
  );
};

export default Page;
