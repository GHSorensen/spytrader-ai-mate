
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <div className="flex justify-end mb-6">
      <Button variant="outline" className="gap-1" asChild>
        <a href="/">
          <ArrowLeftRight className="h-4 w-4 mr-1" />
          Return to Dashboard
        </a>
      </Button>
    </div>
  );
};
