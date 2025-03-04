
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
      <TabsList className="flex flex-col space-y-1 w-full md:hidden bg-background">
        <TabsTrigger value="strategy" className="w-full justify-start p-2 rounded-none">
          <Shield className={`h-4 w-4 mr-2 ${activeTab === 'strategy' ? 'text-primary' : ''}`} />
          <span className="text-sm">Strategy</span>
        </TabsTrigger>
        <TabsTrigger value="risk" className="w-full justify-start p-2 rounded-none">
          <Settings className={`h-4 w-4 mr-2 ${activeTab === 'risk' ? 'text-primary' : ''}`} />
          <span className="text-sm">Risk Management</span>
        </TabsTrigger>
        <TabsTrigger value="market" className="w-full justify-start p-2 rounded-none">
          <BarChart4 className={`h-4 w-4 mr-2 ${activeTab === 'market' ? 'text-primary' : ''}`} />
          <span className="text-sm">Market Conditions</span>
        </TabsTrigger>
        <TabsTrigger value="backtest" className="w-full justify-start p-2 rounded-none">
          <LineChart className={`h-4 w-4 mr-2 ${activeTab === 'backtest' ? 'text-primary' : ''}`} />
          <span className="text-sm">Backtesting</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="w-full justify-start p-2 rounded-none">
          <Sliders className={`h-4 w-4 mr-2 ${activeTab === 'advanced' ? 'text-primary' : ''}`} />
          <span className="text-sm">Advanced</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Desktop tabs (horizontal) */}
      <TabsList className="hidden md:grid md:grid-cols-5 w-full">
        <TabsTrigger value="strategy" className="flex items-center">
          <Shield className={`h-4 w-4 mr-2 ${activeTab === 'strategy' ? 'text-primary' : ''}`} />
          <span>Strategy</span>
        </TabsTrigger>
        <TabsTrigger value="risk" className="flex items-center">
          <Settings className={`h-4 w-4 mr-2 ${activeTab === 'risk' ? 'text-primary' : ''}`} />
          <span>Risk</span>
        </TabsTrigger>
        <TabsTrigger value="market" className="flex items-center">
          <BarChart4 className={`h-4 w-4 mr-2 ${activeTab === 'market' ? 'text-primary' : ''}`} />
          <span>Market</span>
        </TabsTrigger>
        <TabsTrigger value="backtest" className="flex items-center">
          <LineChart className={`h-4 w-4 mr-2 ${activeTab === 'backtest' ? 'text-primary' : ''}`} />
          <span>Backtest</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center">
          <Sliders className={`h-4 w-4 mr-2 ${activeTab === 'advanced' ? 'text-primary' : ''}`} />
          <span>Advanced</span>
        </TabsTrigger>
      </TabsList>
    </>
  );
};
