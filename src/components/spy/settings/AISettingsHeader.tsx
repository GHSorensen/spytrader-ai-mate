
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles } from 'lucide-react';

interface AISettingsHeaderProps {
  activeTab?: string;
}

export const AISettingsHeader: React.FC<AISettingsHeaderProps> = ({ 
  activeTab = 'strategy'
}) => {
  // Define titles and descriptions for each tab
  const tabInfo = {
    strategy: {
      title: "AI Trading Strategy",
      description: "Configure your risk profile and trading preferences"
    },
    risk: {
      title: "Risk Management",
      description: "Set position sizing, stop-losses, and profit targets"
    },
    market: {
      title: "Market Conditions",
      description: "Adjust AI behavior based on different market environments"
    },
    backtest: {
      title: "Backtesting",
      description: "Configure settings to test your strategy against historical data"
    },
    advanced: {
      title: "Advanced Settings",
      description: "Fine-tune advanced AI parameters and market analysis features"
    }
  };

  const currentTab = tabInfo[activeTab as keyof typeof tabInfo];
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl">
        <Sparkles className="h-5 w-5 text-primary" />
        {currentTab.title}
      </DialogTitle>
      <DialogDescription className="mt-1.5">
        {currentTab.description}
      </DialogDescription>
      
      {/* Progress indicator */}
      <div className="flex items-center justify-between mt-4 px-1">
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
            style={{ 
              width: `${
                activeTab === 'strategy' ? 20 :
                activeTab === 'risk' ? 40 :
                activeTab === 'market' ? 60 :
                activeTab === 'backtest' ? 80 : 100
              }%` 
            }}
          />
        </div>
      </div>
    </DialogHeader>
  );
};
