
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AISettingsDialog from './AISettingsDialog';
import NotificationCenter from './notifications/NotificationCenter';

interface SpyHeaderProps {
  minimal?: boolean;
}

export const SpyHeaderWithNotifications: React.FC<SpyHeaderProps> = ({ minimal = false }) => {
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
        <AISettingsDialog />
      </div>
    </div>
  );
};

export default SpyHeaderWithNotifications;
