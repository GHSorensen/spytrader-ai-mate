
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AISettingsFooterProps {
  onCancel: () => void;
  onSave: () => void;
}

export const AISettingsFooter: React.FC<AISettingsFooterProps> = ({
  onCancel,
  onSave,
}) => {
  return (
    <DialogFooter className="mt-6">
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave}>Save Settings</Button>
    </DialogFooter>
  );
};
