
import { toast } from '@/components/ui/use-toast';
import { DEFAULT_SETTINGS } from '../../AISettingsTypes';
import { AITradingSettings } from '@/lib/types/spy';

interface UseAISettingsActionsProps {
  settings: AITradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<AITradingSettings>>;
  initialSettings: AITradingSettings;
  setInitialSettings: React.Dispatch<React.SetStateAction<AITradingSettings>>;
  hasChanges: boolean;
  setShowConfirmDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenChange: (open: boolean) => void;
}

export const useAISettingsActions = ({
  settings,
  setSettings,
  initialSettings,
  setInitialSettings,
  hasChanges,
  setShowConfirmDialog,
  onOpenChange
}: UseAISettingsActionsProps) => {

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

  return {
    updateSettings,
    updateNestedSettings,
    handleSaveSettings,
    handleResetSettings,
    handleCancel,
    handleConfirmCancel,
    handleCancelDialog
  };
};
