
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AISettingsDialog } from './AISettingsDialog';
import NotificationCenter from './notifications/NotificationCenter';
import { RiskToleranceType } from '@/lib/types/spy';
import { schwabDocumentation } from '@/services/dataProviders/schwab/documentation';
import { User, Settings, BarChart2 } from 'lucide-react';

interface SpyHeaderProps {
  minimal?: boolean;
}

export const SpyHeaderWithNotifications: React.FC<SpyHeaderProps> = ({ minimal = false }) => {
  // Add state for AI settings dialog
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState<RiskToleranceType>('moderate');

  // Handler for risk tolerance changes
  const handleRiskToleranceChange = (tolerance: RiskToleranceType) => {
    setRiskTolerance(tolerance);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl text-primary">SPY Trading AI</span>
        </Link>
        
        {!minimal && (
          <nav className="hidden md:flex gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link to="/trades" className="text-muted-foreground hover:text-foreground">Trades</Link>
            <Link to="/performance" className="text-muted-foreground hover:text-foreground">Performance</Link>
            <Link to="/detailed-performance" className="text-muted-foreground hover:text-foreground">Analytics</Link>
            <Link to="/risk-console" className="text-muted-foreground hover:text-foreground">Risk Console</Link>
            <Link to="/schwab-integration" className="text-muted-foreground hover:text-foreground">Schwab Connect</Link>
          </nav>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative group">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => schwabDocumentation.openUserGuide()}
          >
            Schwab Guide
          </Button>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <button 
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => schwabDocumentation.openUserGuide()}
            >
              View Guide
            </button>
            <button 
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => schwabDocumentation.downloadUserGuide()}
            >
              Download Guide
            </button>
            <Link 
              to="/schwab-integration"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Setup Integration
            </Link>
          </div>
        </div>
        
        <Link to="/profile">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
          </Button>
        </Link>
        
        <NotificationCenter />
        
        <Button variant="ghost" size="icon" onClick={() => setIsAISettingsOpen(true)}>
          <span className="sr-only">AI Settings</span>
          <Settings className="h-5 w-5" />
        </Button>
        
        <AISettingsDialog 
          open={isAISettingsOpen}
          onOpenChange={setIsAISettingsOpen}
          currentRiskTolerance={riskTolerance}
          onRiskToleranceChange={handleRiskToleranceChange}
        />
      </div>
    </div>
  );
};

export default SpyHeaderWithNotifications;
