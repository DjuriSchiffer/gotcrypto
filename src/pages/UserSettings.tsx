import React, { useState } from 'react';
import Page from '../components/Page';
import { Button } from 'flowbite-react';
import { useStorage } from '../hooks/useStorage';
import Modal from '../components/Modal';
import { FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';
import SettingsDateFormat from '../components/SettingsDateFormat';
import SettingsPriceFormat from '../components/SettingsPriceFormat';

type UserProps = {};

const UserSettings: React.FC<UserProps> = () => {
    const { setSelectedCurrencies } = useStorage();
    const [openRemoveAllDataModal, setOpenRemoveAllDataModal] = useState<boolean>(false);

    const handleOpenClearAllStoredDataModal = () => {
        setOpenRemoveAllDataModal(true);
    }
    const handleCloseClearAllStoredDataModal = () => {
        setOpenRemoveAllDataModal(false);
    }
    const onRemoveAllData = () => {
        setSelectedCurrencies([]);
        handleCloseClearAllStoredDataModal();
    }

    return (
        <Page>
            <div className="grid gap-4 mb-4 w-6/12 mt-6">
                <div className='grid grid-cols-1'>
                    <h2 className="text-4xl font-extrabold dark:text-white">Currency Settings</h2>
                    <p className="my-4 text-lg text-gray-500">
                        Choose your preferred currency display format
                    </p>
                    <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Select between EUR or USD to update all price displays and Coinmarketcap data accordingly.
                    </p>
                    <SettingsPriceFormat />
                    <hr className="h-px mt-10 mb-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                </div>
                <div className='grid grid-cols-1'>
                    <h2 className="text-4xl font-extrabold dark:text-white">Date Format</h2>
                    <p className="my-4 text-lg text-gray-500">
                        Choose how dates should be displayed throughout the application
                    </p>
                    <SettingsDateFormat />
                    <hr className="h-px mt-10 mb-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                </div>
                <div className='grid grid-cols-1'>
                    <h2 className="text-4xl font-extrabold dark:text-white">Data Management</h2>
                    <p className="my-4 text-lg text-gray-500">
                        ⚠️ Clear all your personal data stored locally and in the cloud
                    </p>
                    <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                        This action will permanently delete all your stored information and cannot be reversed
                    </p>
                    <Button
                        color="failure"
                        onClick={handleOpenClearAllStoredDataModal}
                        className="w-fit"
                    >
                        Delete All Data
                    </Button>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                </div>
            </div>
            <Modal
                onClose={handleCloseClearAllStoredDataModal}
                open={openRemoveAllDataModal}
                title="Confirm Removal of All Data"
            >
                <div className="flex flex-col items-center">
                    <FaExclamationTriangle
                        color="white"
                        className="flex mx-auto mb-4 text-6xl"
                    />
                    <p className="mb-4 text-white">
                        Are you sure you want to remove all your data?
                    </p>
                    <div className="flex space-x-2">
                        <Button color="failure" onClick={onRemoveAllData}>
                            <FaTrashAlt color="white" className="mr-1" />
                            Remove All Transactions
                        </Button>
                        <Button color="dark" onClick={handleCloseClearAllStoredDataModal}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        </Page>
    );
};

export default UserSettings;