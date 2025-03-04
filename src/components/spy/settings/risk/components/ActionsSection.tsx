
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskAction } from '@/lib/types/spy/riskMonitoring';
import { ActionItem } from './ActionItem';

interface ActionsSectionProps {
  actions: RiskAction[];
  latestActions?: RiskAction[];
  isLoading?: boolean;
  getRelativeTime?: (date: Date) => string;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  actions,
  latestActions,
  isLoading = false,
  getRelativeTime
}) => {
  const displayActions = latestActions || actions;
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Recommended Actions</h3>
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }
  
  if (!displayActions || displayActions.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Recommended Actions</h3>
        <div className="text-sm text-muted-foreground">
          No recommended actions at this time.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Recommended Actions</h3>
      <div className="max-h-[300px] overflow-y-auto pr-1">
        {displayActions.map(action => (
          <ActionItem key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};
