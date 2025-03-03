
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const AISettingsHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle>AI Trading Settings</DialogTitle>
      <DialogDescription>
        Configure how the AI agent manages your SPY options trades.
      </DialogDescription>
    </DialogHeader>
  );
};
