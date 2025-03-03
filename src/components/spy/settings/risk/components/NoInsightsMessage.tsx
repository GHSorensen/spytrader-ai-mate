
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const NoInsightsMessage: React.FC = () => {
  return (
    <div className="text-center py-6">
      <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">
        Not enough data to generate insights yet.
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Insights will appear as the AI collects more data on risk management decisions.
      </p>
    </div>
  );
};
