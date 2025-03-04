
import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BrokerageMenu } from './BrokerageMenu';
import { GuidesMenu } from './GuidesMenu';

interface LogoAndNavProps {
  minimal?: boolean;
}

export const LogoAndNav: React.FC<LogoAndNavProps> = ({ minimal = false }) => {
  return (
    <div className="flex items-center gap-2 md:gap-6">
      <Link to="/" className="flex flex-col items-start">
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg md:text-xl text-primary">Spy</span>
          <Search className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        </div>
        <span className="text-[10px] md:text-xs text-muted-foreground leading-tight">Advanced Trading AI</span>
      </Link>
      
      {!minimal && (
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">Dashboard</Link>
          <Link to="/trades" className="text-muted-foreground hover:text-foreground text-sm">Trades</Link>
          <Link to="/performance" className="text-muted-foreground hover:text-foreground text-sm">Performance</Link>
          <Link to="/detailed-performance" className="text-muted-foreground hover:text-foreground text-sm">Analytics</Link>
          <Link to="/risk-console" className="text-muted-foreground hover:text-foreground text-sm">Risk Console</Link>
          <div className="flex items-center gap-2">
            <BrokerageMenu />
            <GuidesMenu />
          </div>
        </nav>
      )}
    </div>
  );
};

export default LogoAndNav;
