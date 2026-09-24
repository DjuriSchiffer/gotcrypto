import { createContext, type ReactNode } from 'react';

import { useStorageState } from '../hooks/useStorageState';

export const StorageContext = createContext<ReturnType<typeof useStorageState> | undefined>(
	undefined
);

export function StorageProvider({ children }: { children: ReactNode }) {
	const value = useStorageState();
	return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}
