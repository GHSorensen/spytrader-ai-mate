
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface AISettingsFooterProps {
  onCancel: () => void;
  onSave: () => void;
  onReset?: () => void;
  activeTab?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasChanges?: boolean;
}

export const AISettingsFooter: React.FC<AISettingsFooterProps> = ({
  onCancel,
  onSave,
  onReset,
  activeTab = 'strategy',
  onPrevious,
  onNext,
  hasChanges = false,
}) => {
  const isFirstTab = activeTab === 'strategy';
  const isLastTab = activeTab === 'advanced';

  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
      <div className="flex gap-2 w-full sm:w-auto order-3 sm:order-1">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 sm:flex-none"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        {onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="flex-1 sm:flex-none"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 order-2 w-full sm:w-auto">
        {!isFirstTab && onPrevious && (
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
        
        {!isLastTab && onNext && (
          <Button 
            variant="secondary" 
            onClick={onNext}
            className="flex-1 sm:flex-none"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {isLastTab && (
          <Button 
            onClick={onSave} 
            className="flex-1 sm:flex-none"
            variant={hasChanges ? "default" : "secondary"}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        )}
      </div>
    </DialogFooter>
  );
};
