import { useContext } from 'react';
import { StorageContext } from '../providers/StorageProvider';
export const useStorage = () => {
	const context = useContext(StorageContext);
	if (context === undefined) {
		throw new Error('useStorage must be used within a StorageProvider');
	}
	return context;
};
