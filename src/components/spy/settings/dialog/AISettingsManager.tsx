
import React from 'react';
import { 
  AISettingsDialogProps
} from '../AISettingsTypes';
import { AITradingSettings } from '@/lib/types/spy';
import { useAISettingsState } from './hooks/useAISettingsState';
import { useAISettingsActions } from './hooks/useAISettingsActions';

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
  const {
    settings,
    setSettings,
    initialSettings,
    setInitialSettings,
    activeTab,
    setActiveTab,
    showConfirmDialog,
    setShowConfirmDialog,
    hasChanges
  } = useAISettingsState(open);
  
  const {
    updateSettings,
    updateNestedSettings,
    handleSaveSettings,
    handleResetSettings,
    handleCancel,
    handleConfirmCancel,
    handleCancelDialog
  } = useAISettingsActions({
    settings,
    setSettings,
    initialSettings,
    setInitialSettings,
    hasChanges,
    setShowConfirmDialog,
    onOpenChange
  });

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
