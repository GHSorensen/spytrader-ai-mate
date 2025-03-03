
import React from 'react';
import { BookOpenIcon } from 'lucide-react';

export const NoInsightsMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/20">
      <BookOpenIcon className="h-10 w-10 text-muted-foreground mb-2" />
      <h4 className="text-muted-foreground font-medium mb-1">No learning insights yet</h4>
      <p className="text-sm text-muted-foreground max-w-md">
        As you use the risk monitoring system, it will learn from your trading patterns 
        and provide personalized insights to help improve your results.
      </p>
    </div>
  );
};
