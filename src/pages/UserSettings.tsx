import { Button } from 'flowbite-react';
import { useState } from 'react';
import { FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';

import Modal from '../components/Modal';
import Page from '../components/Page';
import SettingsDateFormat from '../components/SettingsDateFormat';
import SettingsPriceFormat from '../components/SettingsPriceFormat';
import { useStorage } from '../hooks/useStorage';

function UserSettings() {
	const { setSelectedCurrencies } = useStorage();
	const [openRemoveAllDataModal, setOpenRemoveAllDataModal] = useState<boolean>(false);

	const handleOpenClearAllStoredDataModal = () => {
		setOpenRemoveAllDataModal(true);
	};
	const handleCloseClearAllStoredDataModal = () => {
		setOpenRemoveAllDataModal(false);
	};
	const handleRemoveAllData = async () => {
		await setSelectedCurrencies([]);
		handleCloseClearAllStoredDataModal();
	};

	const onRemoveAllData = () => {
		void handleRemoveAllData();
	};

	return (
		<Page>
			<div className="mb-4 mt-6 grid w-full gap-4 md:w-10/12 lg:w-6/12">
				<div className="grid grid-cols-1">
					<h2 className="text-4xl font-extrabold dark:text-white">Currency Settings</h2>
					<p className="my-4 text-lg text-gray-500">
						Choose your preferred currency display format
					</p>
					<p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
						Select between EUR or USD to update all price displays and Coinmarketcap data
						accordingly.
					</p>
					<SettingsPriceFormat />
					<hr className="mt-10 mb-4 h-px border-0 bg-gray-200 dark:bg-gray-700"></hr>
				</div>
				<div className="grid grid-cols-1">
					<h2 className="text-4xl font-extrabold dark:text-white">Date Format</h2>
					<p className="my-4 text-lg text-gray-500">
						Choose how dates should be displayed throughout the application
					</p>
					<SettingsDateFormat />
					<hr className="mt-10 mb-4 h-px border-0 bg-gray-200 dark:bg-gray-700"></hr>
				</div>
				<div className="grid grid-cols-1">
					<h2 className="text-4xl font-extrabold dark:text-white">Data Management</h2>
					<p className="my-4 text-lg text-gray-500">
						⚠️ Clear all your personal data stored locally and in the cloud
					</p>
					<p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
						This action will permanently delete all your stored information and cannot be reversed
					</p>
					<Button className="w-fit" color="failure" onClick={handleOpenClearAllStoredDataModal}>
						Delete All Data
					</Button>
					<hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
				</div>
			</div>
			<Modal
				onClose={handleCloseClearAllStoredDataModal}
				open={openRemoveAllDataModal}
				title="Confirm Removal of All Data"
			>
				<div className="flex flex-col items-center">
					<FaExclamationTriangle className="mx-auto mb-4 flex text-6xl" color="white" />
					<p className="mb-4 text-white">Are you sure you want to remove all your data?</p>
					<div className="flex space-x-2">
						<Button color="failure" onClick={onRemoveAllData}>
							<FaTrashAlt className="mr-1" color="white" />
							Remove All Transactions
						</Button>
						<Button color="dark" onClick={handleCloseClearAllStoredDataModal}>
							Cancel
						</Button>
					</div>
				</div>
			</Modal>
		</Page>
	);
}

export default UserSettings;
