
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const provider = getDataProvider();
        
        // Ensure provider is connected
        if (!provider.isConnected()) {
          console.log('Provider not connected, attempting to connect...');
          const connected = await provider.connect();
          if (!connected) {
            console.warn('Could not connect to data provider');
            setError('Unable to connect to your brokerage. Please check your connection settings.');
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
            setError('No account data received from your brokerage.');
          }
        } else {
          console.warn('Data provider does not implement getAccountData method');
          // Use default values
          setAccountData({
            balance: 1600,
            dailyPnL: 0,
            allTimePnL: 0
          });
          
          setError('Your current data provider does not support retrieving account data.');
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setError('Failed to fetch account balance: ' + (error instanceof Error ? error.message : 'Unknown error'));
        toast.error('Failed to fetch account balance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
    
    // Refresh account data every 30 seconds for more real-time updates
    const intervalId = setInterval(fetchAccountData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return { 
    ...accountData, 
    isLoading,
    lastUpdated,
    error
  };
};
