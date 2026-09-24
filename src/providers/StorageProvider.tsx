import type { ReactNode } from 'react';

import { StorageContext } from '../contexts/StorageContext';
import { useStorageState } from '../hooks/useStorageState';

type StorageProviderProps = {
	children: ReactNode;
};

function StorageProvider({ children }: StorageProviderProps) {
	const value = useStorageState();
	return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

export default StorageProvider;
