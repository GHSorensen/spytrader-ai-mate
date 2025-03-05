
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface RetryStatusIndicatorProps {
  isRetrying: boolean;
  retryCount: number;
  maxRetries?: number;
}

/**
 * Component to show retry status in the UI when data fetching operations are retrying
 */
const RetryStatusIndicator: React.FC<RetryStatusIndicatorProps> = ({
  isRetrying,
  retryCount,
  maxRetries = 3
}) => {
  if (!isRetrying) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1.5 py-1 px-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Retrying</span>
              {retryCount > 0 && (
                <span className="ml-1 text-xs">
                  ({retryCount}/{maxRetries})
                </span>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold mb-1">Automatic Retry</div>
            <p>Experiencing connection issues. Retry attempt {retryCount} of {maxRetries}.</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RetryStatusIndicator;
