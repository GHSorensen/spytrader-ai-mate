
import React from 'react';
import { RiskAction } from '@/lib/types/spy/riskMonitoring';
import { ActionItem } from './ActionItem';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon } from 'lucide-react';

interface ActionsSectionProps {
  actions: RiskAction[];
  isLoading: boolean;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({ actions, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">Recommended Actions</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-2">
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Recommended Actions</h3>
      
      {actions.length === 0 ? (
        <div className="flex items-center p-4 border rounded-md bg-muted/20">
          <AlertCircleIcon className="h-4 w-4 text-muted-foreground mr-2" />
          <p className="text-xs text-muted-foreground">
            No actions recommended at this time
          </p>
        </div>
      ) : (
        actions.map((action) => (
          <ActionItem key={action.id} action={action} />
        ))
      )}
    </div>
  );
};
