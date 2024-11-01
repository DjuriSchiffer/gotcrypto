import React from 'react';
import { Button } from 'flowbite-react';
import { FaTrashAlt } from 'react-icons/fa';
import Modal from '../components/Modal';
import AddAssetForm from '../components/AddAssetForm';
import { Asset } from '../types/currency';
import { CurrencyQuote } from 'api';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DetailModalsProps {
    openAddAssetModal: boolean;
    openEditAssetModal: boolean;
    openRemoveAssetModal: boolean;
    openRemoveAllAssetsModal: boolean;
    currentAsset: Asset | null;
    currencyQuote: keyof CurrencyQuote;
    selectedCurrencyName?: string;
    onCloseModals: () => void;
    onFormSubmit: (formData: any) => void;
    onRemoveAsset: () => void;
    onRemoveAllAssets: () => void;
}

const DetailModals: React.FC<DetailModalsProps> = ({
    openAddAssetModal,
    openEditAssetModal,
    openRemoveAssetModal,
    openRemoveAllAssetsModal,
    currentAsset,
    currencyQuote,
    selectedCurrencyName,
    onCloseModals,
    onFormSubmit,
    onRemoveAsset,
    onRemoveAllAssets,
}) => (
    <>
        <Modal
            onClose={onCloseModals}
            open={openAddAssetModal}
            title="Add Asset"
        >
            <AddAssetForm
                key={`add-form-${openAddAssetModal}`}
                onSubmit={onFormSubmit}
                submitLabel="Add Asset"
                currencyQuote={currencyQuote}
                isEdit={false}
            />
        </Modal>

        <Modal
            onClose={onCloseModals}
            open={openEditAssetModal}
            title="Edit Asset"
        >
            <AddAssetForm
                key={`edit-form-${openEditAssetModal}-${currentAsset?.id}`}
                onSubmit={onFormSubmit}
                defaultValues={currentAsset ? {
                    amount: currentAsset.amount,
                    purchasePrice: currentAsset.purchasePrice,
                    date: currentAsset.date,
                } : undefined}
                submitLabel="Update Asset"
                currencyQuote={currencyQuote}
                isEdit={true}
            />
        </Modal>

        <Modal
            onClose={onCloseModals}
            open={openRemoveAssetModal}
            title="Confirm Removal"
        >
            <div className="flex flex-col items-center">
                <FaExclamationTriangle
                    color="white"
                    className="flex mx-auto mb-4 text-6xl"
                />
                <p className="mb-4">Are you sure you want to remove this asset?</p>
                <div className="flex space-x-2">
                    <Button color="failure" onClick={onRemoveAsset}>
                        <FaTrashAlt color="white" className="mr-1" />
                        Remove Asset
                    </Button>
                    <Button onClick={onCloseModals}>Cancel</Button>
                </div>
            </div>
        </Modal>

        <Modal
            onClose={onCloseModals}
            open={openRemoveAllAssetsModal}
            title="Confirm Removal of All Assets"
        >
            <div className="flex flex-col items-center">
                <FaExclamationTriangle
                    color="white"
                    className="flex mx-auto mb-4 text-6xl"
                />
                <p className="mb-4">
                    Are you sure you want to remove all assets for {selectedCurrencyName}?
                </p>
                <div className="flex space-x-2">
                    <Button color="failure" onClick={onRemoveAllAssets}>
                        <FaTrashAlt color="white" className="mr-1" />
                        Remove All Assets
                    </Button>
                    <Button onClick={onCloseModals}>Cancel</Button>
                </div>
            </div>
        </Modal>
    </>
);

export default DetailModals;