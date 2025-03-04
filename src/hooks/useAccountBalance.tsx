
import { useState, useEffect } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { toast } from 'sonner';

export const useAccountBalance = () => {
  const [accountData, setAccountData] = useState({
    balance: 0,
    dailyPnL: 0,
    allTimePnL: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true);
        const provider = getDataProvider();
        
        // Ensure provider is connected
        if (!provider.isConnected()) {
          console.log('Provider not connected, attempting to connect...');
          const connected = await provider.connect();
          if (!connected) {
            console.warn('Could not connect to data provider');
            setIsLoading(false);
            return;
          }
        }
        
        // Check if the provider implements getAccountData
        if (typeof provider.getAccountData === 'function') {
          console.log('Fetching account balance from provider...');
          const data = await provider.getAccountData();
          console.log('Account data received:', data);
          
          if (data) {
            setAccountData(data);
            setLastUpdated(new Date());
          } else {
            console.warn('Received null or undefined account data');
          }
        } else {
          console.warn('Data provider does not implement getAccountData method');
          // Use default values
          setAccountData({
            balance: 1600,
            dailyPnL: 0,
            allTimePnL: 0
          });
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        toast.error('Failed to fetch account balance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
    
    // Refresh account data every minute
    const intervalId = setInterval(fetchAccountData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return { 
    ...accountData, 
    isLoading,
    lastUpdated
  };
};
