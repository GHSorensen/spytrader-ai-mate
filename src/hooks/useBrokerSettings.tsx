
import { useState, useEffect } from 'react';
import { BrokerSettings, BrokerType } from '@/lib/types/spy/broker';
import { useDataProvider } from '@/hooks/useDataProvider';

interface UseBrokerSettingsProps {
  currentSettings: BrokerSettings;
}

export const useBrokerSettings = ({ currentSettings }: UseBrokerSettingsProps) => {
  const [settings, setSettings] = useState<BrokerSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'ib' | 'td' | 'none'>(
    currentSettings.type === 'interactive-brokers' ? 'ib' : 
    currentSettings.type === 'td-ameritrade' ? 'td' : 'none'
  );
  
  // Get data provider for connection testing
  const { provider, status, isConnecting, connect } = useDataProvider(settings);

  // Reset local state when dialog opens
  useEffect(() => {
    setSettings(currentSettings);
    setActiveTab(
      currentSettings.type === 'interactive-brokers' ? 'ib' : 
      currentSettings.type === 'td-ameritrade' ? 'td' : 'none'
    );
  }, [currentSettings]);

  // Update credentials in the settings state
  const updateCredential = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value
      }
    }));
  };

  // Toggle paper trading
  const togglePaperTrading = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      paperTrading: enabled
    }));
  };
  
  // Test connection to broker
  const testConnection = async () => {
    if (provider) {
      await connect();
    }
  };

  // Prepare final settings with the correct broker type
  const prepareSettingsForSave = () => {
    const brokerType: BrokerType = 
      activeTab === 'ib' ? 'interactive-brokers' : 
      activeTab === 'td' ? 'td-ameritrade' : 'none';
    
    return {
      ...settings,
      type: brokerType,
      isConnected: status.connected,
      lastConnected: status.connected ? new Date() : undefined
    };
  };

  return {
    settings,
    activeTab,
    setActiveTab,
    status,
    isConnecting,
    updateCredential,
    togglePaperTrading,
    testConnection,
    prepareSettingsForSave
  };
};
