
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AISettingsTabsProps {
  activeTab: string;
}

export const AISettingsTabs: React.FC<AISettingsTabsProps> = ({
  activeTab,
}) => {
  return (
    <TabsList className="grid grid-cols-5 w-full">
      <TabsTrigger value="strategy">Strategy</TabsTrigger>
      <TabsTrigger value="risk">Risk Management</TabsTrigger>
      <TabsTrigger value="market">Market Conditions</TabsTrigger>
      <TabsTrigger value="backtest">Backtesting</TabsTrigger>
      <TabsTrigger value="advanced">Advanced</TabsTrigger>
    </TabsList>
  );
};
