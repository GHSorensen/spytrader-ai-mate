
import { useCallback } from 'react';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { clearDataProvider } from '@/services/dataProviders/dataProviderFactory';

export const useIBKRConfigManager = () => {
  const saveIBKRConfig = useCallback((config: DataProviderConfig) => {
    localStorage.setItem('ibkr-config', JSON.stringify(config));
    // Clear existing provider to force recreation with new config
    clearDataProvider();
  }, []);
  
  return {
    saveIBKRConfig
  };
};
