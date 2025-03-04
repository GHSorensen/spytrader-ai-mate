
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

interface IBKRHandlersProps {
  apiKey: string;
  callbackUrl: string;
  twsHost: string;
  twsPort: string;
  isPaperTrading: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (value: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setIsConfigured: (value: boolean) => void;
  navigate: (path: string) => void;
}

export function useIBKRHandlers({
  apiKey,
  callbackUrl,
  twsHost,
  twsPort,
  isPaperTrading,
  setIsConnecting,
  setConnectionStatus,
  setIsConfigured,
  navigate
}: IBKRHandlersProps) {
  
  const handleStartAuth = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      if (!apiKey) {
        toast.error("Please enter your API Key");
        setIsConnecting(false);
        setConnectionStatus('error');
        return;
      }
      
      // Save config to local storage
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        apiKey,
        callbackUrl
      };
      
      localStorage.setItem('ibkr-config', JSON.stringify(config));
      
      // Initialize auth handler
      const ibkrAuth = new IBKRAuth(config);
      
      // Get authorization URL
      const authUrl = ibkrAuth.getAuthorizationUrl();
      
      // Redirect to IBKR auth page
      console.log("Redirecting to IBKR auth URL:", authUrl);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Error starting IBKR auth process:", error);
      toast.error("Failed to connect to Interactive Brokers. Please try again.");
      setIsConnecting(false);
      setConnectionStatus('error');
    }
  };
  
  const handleTwsConnect = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      if (!twsHost || !twsPort) {
        toast.error("Please enter TWS host and port");
        setIsConnecting(false);
        setConnectionStatus('error');
        return;
      }
      
      // Save TWS config to local storage
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        twsHost,
        twsPort,
        connectionMethod: 'tws',
        paperTrading: isPaperTrading
      };
      
      localStorage.setItem('ibkr-config', JSON.stringify(config));
      
      // Get data provider instance
      const ibkrProvider = getDataProvider(config);
      
      // Test connection
      const connected = await ibkrProvider.connect();
      
      if (connected) {
        toast.success("Successfully connected to TWS!");
        setConnectionStatus('connected');
        setIsConfigured(true);
      } else {
        toast.error("Failed to connect to TWS. Please check if TWS is running and API connections are enabled.");
        setConnectionStatus('error');
      }
      
      setIsConnecting(false);
      
    } catch (error) {
      console.error("Error configuring TWS connection:", error);
      toast.error("Failed to configure TWS connection. Please try again.");
      setIsConnecting(false);
      setConnectionStatus('error');
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleTestConnection = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      // Get saved config
      const savedConfig = localStorage.getItem('ibkr-config');
      if (!savedConfig) {
        toast.error("No IBKR configuration found. Please connect first.");
        setIsConnecting(false);
        setConnectionStatus('error');
        return;
      }
      
      const config = JSON.parse(savedConfig);
      
      // Initialize data provider
      const ibkrProvider = getDataProvider(config);
      
      // Test connection
      const connected = await ibkrProvider.connect();
      
      if (connected) {
        toast.success("Successfully connected to IBKR!");
        setConnectionStatus('connected');
      } else {
        toast.error("Failed to connect to IBKR. Please check your settings and try again.");
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error("Error testing IBKR connection:", error);
      toast.error("Connection test failed. Please try again.");
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };
  
  return {
    handleStartAuth,
    handleTwsConnect,
    handleBackToDashboard,
    handleTestConnection
  };
}
