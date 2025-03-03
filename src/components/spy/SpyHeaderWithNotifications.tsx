
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AISettingsDialog } from './AISettingsDialog';
import NotificationCenter from './notifications/NotificationCenter';
import { RiskToleranceType } from '@/lib/types/spy';

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
            <Link to="/risk-console" className="text-muted-foreground hover:text-foreground">Risk Console</Link>
          </nav>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <Button variant="ghost" size="icon" onClick={() => setIsAISettingsOpen(true)}>
          <span className="sr-only">AI Settings</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
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
