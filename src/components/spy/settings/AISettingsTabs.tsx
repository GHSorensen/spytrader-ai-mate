
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Shield, BarChart4, LineChart, Sliders 
} from 'lucide-react';

interface AISettingsTabsProps {
  activeTab: string;
}

export const AISettingsTabs: React.FC<AISettingsTabsProps> = ({
  activeTab,
}) => {
  return (
    <>
      {/* Mobile tabs (vertical stack) */}
      <TabsList className="flex flex-col space-y-1 w-full md:hidden">
        <TabsTrigger value="strategy" className="justify-start">
          <Shield className="h-4 w-4 mr-2" />
          Strategy
        </TabsTrigger>
        <TabsTrigger value="risk" className="justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Risk Management
        </TabsTrigger>
        <TabsTrigger value="market" className="justify-start">
          <BarChart4 className="h-4 w-4 mr-2" />
          Market Conditions
        </TabsTrigger>
        <TabsTrigger value="backtest" className="justify-start">
          <LineChart className="h-4 w-4 mr-2" />
          Backtesting
        </TabsTrigger>
        <TabsTrigger value="advanced" className="justify-start">
          <Sliders className="h-4 w-4 mr-2" />
          Advanced
        </TabsTrigger>
      </TabsList>
      
      {/* Desktop tabs (horizontal) */}
      <TabsList className="hidden md:grid md:grid-cols-5 w-full">
        <TabsTrigger value="strategy" className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span>Strategy</span>
        </TabsTrigger>
        <TabsTrigger value="risk" className="flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          <span>Risk</span>
        </TabsTrigger>
        <TabsTrigger value="market" className="flex items-center">
          <BarChart4 className="h-4 w-4 mr-2" />
          <span>Market</span>
        </TabsTrigger>
        <TabsTrigger value="backtest" className="flex items-center">
          <LineChart className="h-4 w-4 mr-2" />
          <span>Backtest</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center">
          <Sliders className="h-4 w-4 mr-2" />
          <span>Advanced</span>
        </TabsTrigger>
      </TabsList>
    </>
  );
};
