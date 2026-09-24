import { createContext } from 'react';

import type { useStorageState } from '../hooks/useStorageState';

export type StorageContextType = ReturnType<typeof useStorageState>;

export const StorageContext = createContext<StorageContextType | undefined>(undefined);
