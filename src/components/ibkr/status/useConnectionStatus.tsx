
import { useState, useEffect } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState({
    connected: false,
    errorMessage: null as string | null,
    quotesDelayed: true,
    lastChecked: new Date()
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      console.log("IBKRStatusIndicator - Auth check:", hasSession);
      setIsAuthenticated(hasSession);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed in IBKRStatusIndicator:', event, !!session);
        setIsAuthenticated(!!session);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  // Check detailed status on mount and when connection changes
  const checkDetailedStatus = async () => {
    try {
      if (!isAuthenticated) {
        setStatus({
          connected: false,
          errorMessage: "Not authenticated",
          quotesDelayed: true,
          lastChecked: new Date()
        });
        return;
      }
      
      const provider = getDataProvider();
      console.log("IBKRStatusIndicator - Provider:", provider?.constructor.name);
      
      if (provider && provider.isConnected()) {
        // If provider has status property, use it for detailed status
        const providerStatus = (provider as any).status || {
          connected: true,
          quotesDelayed: true,
          lastUpdated: new Date()
        };
        
        setStatus({
          connected: providerStatus.connected,
          errorMessage: providerStatus.errorMessage,
          quotesDelayed: providerStatus.quotesDelayed,
          lastChecked: providerStatus.lastUpdated || new Date()
        });
        
        console.log("IBKRStatusIndicator - Provider status:", providerStatus);
      } else {
        setStatus({
          connected: false,
          errorMessage: "Not connected to Interactive Brokers",
          quotesDelayed: true,
          lastChecked: new Date()
        });
        
        console.log("IBKRStatusIndicator - Not connected to provider");
      }
    } catch (error) {
      console.error("Error checking IBKR status:", error);
      setStatus({
        connected: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        quotesDelayed: true,
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    checkDetailedStatus();
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    status,
    refreshing,
    setRefreshing,
    checkDetailedStatus
  };
};

export default useConnectionStatus;
