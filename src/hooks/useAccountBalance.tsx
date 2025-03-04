
import { useState, useEffect } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { toast } from 'sonner';

export const useAccountBalance = () => {
  const [accountData, setAccountData] = useState({
    balance: 0,
    dailyPnL: 0,
    allTimePnL: 0
  });

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const provider = getDataProvider();
        if (provider.isConnected()) {
          // For now we're using mock data until the actual TWS account data
          // endpoints are implemented
          const data = await provider.getAccountData();
          setAccountData(data);
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        toast.error('Failed to fetch account balance');
      }
    };

    fetchAccountData();
    
    // Refresh account data every minute
    const intervalId = setInterval(fetchAccountData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return accountData;
};
