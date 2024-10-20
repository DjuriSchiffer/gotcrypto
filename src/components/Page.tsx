import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <Navbar />
      <div className="p-4 min-h-[calc(100vh_-_56px)]">{children}</div>
    </main>
  );
};

export default Page;
