import { useContext } from 'react';

import type { StorageContextType } from '../contexts/StorageContext';

import { StorageContext } from '../contexts/StorageContext';

export const useStorage = (): StorageContextType => {
	const context = useContext(StorageContext);
	if (context === undefined) {
		throw new Error('useStorage must be used within a StorageProvider');
	}
	return context;
};
