
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X } from 'lucide-react';

interface AISettingsFooterProps {
  onCancel: () => void;
  onSave: () => void;
}

export const AISettingsFooter: React.FC<AISettingsFooterProps> = ({
  onCancel,
  onSave,
}) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
      <Button 
        variant="outline" 
        onClick={onCancel} 
        className="w-full sm:w-auto order-2 sm:order-1"
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button 
        onClick={onSave} 
        className="w-full sm:w-auto order-1 sm:order-2"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Settings
      </Button>
    </DialogFooter>
  );
};
