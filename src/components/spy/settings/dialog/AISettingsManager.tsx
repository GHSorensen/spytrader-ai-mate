
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  AISettingsDialogProps, 
  DEFAULT_SETTINGS 
} from '../AISettingsTypes';
import { AITradingSettings } from '@/lib/types/spy';

interface AISettingsManagerProps extends AISettingsDialogProps {
  children: (props: AISettingsManagerChildProps) => React.ReactNode;
}

export interface AISettingsManagerChildProps {
  settings: AITradingSettings;
  initialSettings: AITradingSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasChanges: boolean;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
  handleSaveSettings: () => void;
  handleResetSettings: () => void;
  handleCancel: () => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  handleConfirmCancel: () => void;
  handleCancelDialog: () => void;
}

export const AISettingsManager: React.FC<AISettingsManagerProps> = ({
  open,
  onOpenChange,
  currentRiskTolerance,
  onRiskToleranceChange,
  children
}) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('strategy');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Set initial settings when the dialog opens
  useEffect(() => {
    if (open) {
      setInitialSettings({...settings});
    }
  }, [open]);
  
  // Check if settings have changed
  useEffect(() => {
    if (open) {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(initialSettings));
    }
  }, [settings, initialSettings, open]);
  
  const updateSettings = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = <K extends keyof typeof settings, N extends keyof typeof settings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as object),
        [childKey]: value,
      },
    }));
  };
  
  const handleSaveSettings = () => {
    // Here you would save the settings to your backend or local storage
    toast({
      title: "AI Settings Saved",
      description: "Your trading preferences have been updated",
    });
    setInitialSettings({...settings});
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
      variant: "default",
    });
  };
  
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onOpenChange(false);
    }
  };
  
  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    onOpenChange(false);
  };
  
  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
  };

  const childProps: AISettingsManagerChildProps = {
    settings,
    initialSettings,
    activeTab,
    setActiveTab,
    hasChanges,
    updateSettings,
    updateNestedSettings,
    handleSaveSettings,
    handleResetSettings,
    handleCancel,
    showConfirmDialog,
    setShowConfirmDialog,
    handleConfirmCancel,
    handleCancelDialog
  };

  return children(childProps);
};
