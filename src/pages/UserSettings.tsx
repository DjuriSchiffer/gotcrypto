import React from 'react';
import Page from '../components/Page';
import { ChangeQuote } from '../components/ChangeQuote';

type UserProps = {};

const UserSettings: React.FC<UserProps> = () => {
    return (
        <Page>
            <div className="grid gap-4 mb-4 w-5/12 mt-6">
                <div className='grid grid-cols-1'>
                    <h2 className="text-4xl font-extrabold dark:text-white">Currency Settings</h2>
                    <p className="my-4 text-lg text-gray-500">
                        Choose your preferred currency display format
                    </p>
                    <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Select between EUR or USD to update all price displays and Coinmarketcap data accordingly.
                    </p>
                    <ChangeQuote />
                    <hr className="h-px mt-10 mb-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                </div>
                <div className='grid grid-cols-1'>
                    <h2 className="text-4xl font-extrabold dark:text-white">Stored data</h2>
                    <p className="my-4 text-lg text-gray-500">
                        Choose your preferred currency display format
                    </p>
                    <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Select between EUR or USD to update all price displays and Coinmarketcap data accordingly.
                    </p>
                    <ChangeQuote />
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                </div>
            </div>
        </Page>
    );
};

export default UserSettings;