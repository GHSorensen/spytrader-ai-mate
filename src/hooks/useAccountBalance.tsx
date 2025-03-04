
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useAccountBalance = () => {
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, !!session);
        setIsAuthenticated(!!session);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);
  
  // Use React Query for improved caching and automatic refetching
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['accountBalance', isAuthenticated],
    queryFn: async () => {
      try {
        console.log('Fetching account balance...', 'Auth state:', isAuthenticated);
        setError(null);
        
        // If not authenticated, return mock data
        if (!isAuthenticated) {
          console.log('Not authenticated, returning default balance');
          return {
            balance: 125000,
            dailyPnL: 1200,
            allTimePnL: 15000
          };
        }
        
        const provider = getDataProvider();
        console.log('Got provider:', provider);
        
        if (!provider) {
          console.error('No data provider found');
          setError('No data provider available. Please check your connection settings.');
          return {
            balance: 125000,
            dailyPnL: 1200,
            allTimePnL: 15000
          };
        }
        
        // Ensure provider is connected
        if (!provider.isConnected()) {
          console.log('Provider not connected, attempting to connect...');
          try {
            const connected = await provider.connect();
            if (!connected) {
              console.warn('Could not connect to data provider');
              setError('Unable to connect to your brokerage. Please check your connection settings.');
              return {
                balance: 125000,
                dailyPnL: 1200,
                allTimePnL: 15000
              };
            }
          } catch (connectionError) {
            console.error('Error connecting to provider:', connectionError);
          }
        }
        
        // Check if the provider implements getAccountData
        if (provider && typeof provider.getAccountData === 'function') {
          console.log('Fetching account balance from provider...');
          const accountData = await provider.getAccountData();
          console.log('Account data received:', accountData);
          
          if (accountData) {
            toast.success('Balance updated');
            return accountData;
          } else {
            console.warn('Received null or undefined account data');
            setError('No account data received from your brokerage.');
            // Return default values
            return {
              balance: 125000,
              dailyPnL: 1200,
              allTimePnL: 15000
            };
          }
        } else {
          console.warn('Data provider does not implement getAccountData method');
          // Use default values
          return {
            balance: 125000,
            dailyPnL: 1200,
            allTimePnL: 15000
          };
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setError('Failed to fetch account balance: ' + (error instanceof Error ? error.message : 'Unknown error'));
        toast.error('Failed to fetch account balance');
        
        // Return default values on error
        return {
          balance: 125000,
          dailyPnL: 1200,
          allTimePnL: 15000
        };
      }
    },
    // Refresh every 30 seconds
    refetchInterval: 30000,
    // Refresh when window regains focus
    refetchOnWindowFocus: true,
    // Start with something while loading
    placeholderData: {
      balance: 125000,
      dailyPnL: 1200,
      allTimePnL: 15000
    },
    staleTime: 15000, // Consider data fresh for 15 seconds
    enabled: true, // Always enable the query regardless of authentication state
  });
  
  // Function to manually refresh data
  const refreshBalance = useCallback(() => {
    console.log('Manually refreshing account balance...');
    toast.info('Refreshing account balance...');
    return refetch();
  }, [refetch]);

  useEffect(() => {
    // Fetch balance on mount
    console.log('Account balance hook mounted, fetching initial data');
  }, []);

  return { 
    ...data,
    isLoading,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    error,
    refreshBalance,
    isAuthenticated
  };
};
