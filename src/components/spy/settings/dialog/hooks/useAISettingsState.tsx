
import { useState, useEffect } from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { DEFAULT_SETTINGS } from '../../AISettingsTypes';

export const useAISettingsState = (open: boolean) => {
  const [settings, setSettings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('strategy');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Set initial settings when the dialog opens
  useEffect(() => {
    if (open) {
      setInitialSettings({...settings});
    }
  }, [open, settings]);
  
  // Check if settings have changed
  useEffect(() => {
    if (open) {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(initialSettings));
    }
  }, [settings, initialSettings, open]);
  
  return {
    settings,
    setSettings,
    initialSettings,
    setInitialSettings,
    activeTab,
    setActiveTab,
    showConfirmDialog,
    setShowConfirmDialog,
    hasChanges
  };
};
