
import React, { useState } from 'react';
import { SpyHeader } from '@/components/spy/SpyHeader';
import { SpyOverview } from '@/components/spy/SpyOverview';
import { OptionChain } from '@/components/spy/OptionChain';
import { ActiveTrades } from '@/components/spy/ActiveTrades';
import PerformanceDashboard from '@/components/spy/PerformanceDashboard';
import { Button } from '@/components/ui/button';
import { ChevronDown, RefreshCw, Settings, Sliders, Server, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiskToleranceType } from '@/lib/types/spy';
import { AISettingsDialog } from '@/components/spy/AISettingsDialog';
import { BrokerSettings } from '@/components/spy/settings/BrokerSettings';
import { BrokerSettings as BrokerSettingsType } from '@/lib/types/spy/broker';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const Index = () => {
  const [riskTolerance, setRiskTolerance] = useState<RiskToleranceType>('moderate');
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isBrokerSettingsOpen, setIsBrokerSettingsOpen] = useState(false);
  const [brokerSettings, setBrokerSettings] = useState<BrokerSettingsType>({
    type: 'none',
    isConnected: false,
    credentials: {},
    paperTrading: true
  });

  const handleRiskToleranceChange = (tolerance: RiskToleranceType) => {
    setRiskTolerance(tolerance);
    toast({
      title: "Risk Tolerance Updated",
      description: `Strategy set to ${tolerance} risk profile`,
    });
  };

  const handleBrokerSettingsSave = (settings: BrokerSettingsType) => {
    setBrokerSettings(settings);
    // Here you would typically save these to your backend or local storage
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <SpyHeader />
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="icon" className="md:hidden">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsBrokerSettingsOpen(true)}
              className={brokerSettings.isConnected ? "border-green-500 text-green-500 hover:text-green-600 hover:border-green-600" : ""}
            >
              <Server className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">SPY Options Dashboard</h2>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  Risk Tolerance
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRiskToleranceChange('conservative')}>
                  Conservative
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRiskToleranceChange('moderate')}>
                  Moderate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRiskToleranceChange('aggressive')}>
                  Aggressive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="gap-1" onClick={() => setIsAISettingsOpen(true)}>
              <Sliders className="h-4 w-4 mr-1" />
              AI Settings
            </Button>
            
            <Link to="/risk-monitoring-test">
              <Button variant="outline" className="gap-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Test Risk UI
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-4">
            <SpyOverview />
          </div>
          <div className="col-span-1 md:col-span-4">
            <ActiveTrades riskTolerance={riskTolerance} />
          </div>
          <div className="col-span-1 md:col-span-4">
            <OptionChain />
          </div>
          <div className="col-span-1 md:col-span-12">
            <PerformanceDashboard />
          </div>
        </div>
      </main>

      {/* AI Settings Dialog */}
      <AISettingsDialog 
        open={isAISettingsOpen} 
        onOpenChange={setIsAISettingsOpen}
        currentRiskTolerance={riskTolerance}
        onRiskToleranceChange={handleRiskToleranceChange}
      />

      {/* Broker Settings Dialog */}
      <BrokerSettings
        open={isBrokerSettingsOpen}
        onOpenChange={setIsBrokerSettingsOpen}
        currentSettings={brokerSettings}
        onSave={handleBrokerSettingsSave}
      />
    </div>
  );
};

export default Index;
