
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles } from 'lucide-react';

export const AISettingsHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl">
        <Sparkles className="h-5 w-5 text-primary" />
        AI Trading Settings
      </DialogTitle>
      <DialogDescription className="mt-1.5">
        Customize how the AI manages your SPY options trades. These settings affect risk, strategy, and overall performance.
      </DialogDescription>
    </DialogHeader>
  );
};
