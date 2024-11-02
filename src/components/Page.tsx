import React, { ReactNode } from 'react';
import SideBar from './SideBar';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <div className="p-4">
        <div className="grid gap-4 w-full grid-cols-6">
          <div className='col-span-1'>
            <SideBar />
          </div>
          <div className='col-span-5 ml-6'>{children}</div>
        </div>
      </div>
    </main>
  );
};

export default Page;
