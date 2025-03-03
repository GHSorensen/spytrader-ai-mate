
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { AISettingsDialogProps } from './settings/AISettingsTypes';

// Import our components
import { AISettingsHeader } from './settings/AISettingsHeader';
import { AISettingsFooter } from './settings/AISettingsFooter';
import { AISettingsManager } from './settings/dialog/AISettingsManager';
import { AISettingsContent } from './settings/dialog/AISettingsContent';
import { SettingsConfirmDialog } from './settings/dialog/SettingsConfirmDialog';

export const AISettingsDialog = ({
  open,
  onOpenChange,
  currentRiskTolerance,
  onRiskToleranceChange,
}: AISettingsDialogProps) => {
  return (
    <AISettingsManager
      open={open}
      onOpenChange={onOpenChange}
      currentRiskTolerance={currentRiskTolerance}
      onRiskToleranceChange={onRiskToleranceChange}
    >
      {({
        settings,
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
      }) => (
        <>
          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
              <div className="p-6 pb-0">
                <AISettingsHeader activeTab={activeTab} />
              </div>
              
              <AISettingsContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                settings={settings}
                updateSettings={updateSettings}
                updateNestedSettings={updateNestedSettings}
                currentRiskTolerance={currentRiskTolerance}
                onRiskToleranceChange={onRiskToleranceChange}
              />
              
              <div className="p-6 pt-0">
                <AISettingsFooter 
                  onCancel={handleCancel}
                  onSave={handleSaveSettings}
                  onReset={handleResetSettings}
                  activeTab={activeTab}
                  hasChanges={hasChanges}
                  onPrevious={() => {
                    const tabs = ['strategy', 'risk', 'market', 'backtest', 'advanced'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  onNext={() => {
                    const tabs = ['strategy', 'risk', 'market', 'backtest', 'advanced'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Confirmation Dialog for Unsaved Changes */}
          <SettingsConfirmDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            onConfirm={handleConfirmCancel}
            onCancel={handleCancelDialog}
          />
        </>
      )}
    </AISettingsManager>
  );
};
