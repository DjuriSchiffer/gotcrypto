import { useState, useCallback } from 'react';

export const useAssetSelection = (initialAssets: number[] = []) => {
	const [selectedAssets, setSelectedAssets] = useState<number[]>(initialAssets);

	const toggleAssetSelection = useCallback((cmcId: number) => {
		setSelectedAssets((prevSelected) => {
			if (prevSelected.includes(cmcId)) {
				return prevSelected.filter((id) => id !== cmcId);
			} else {
				return [...prevSelected, cmcId];
			}
		});
	}, []);

	const resetSelection = useCallback(() => {
		setSelectedAssets([]);
	}, []);

	const setSelection = useCallback((assets: number[]) => {
		setSelectedAssets(assets);
	}, []);

	return {
		selectedAssets,
		toggleAssetSelection,
		resetSelection,
		setSelection,
	};
};
