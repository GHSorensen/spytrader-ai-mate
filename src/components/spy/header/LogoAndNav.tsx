
import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface LogoAndNavProps {
  minimal?: boolean;
}

export const LogoAndNav: React.FC<LogoAndNavProps> = ({ minimal = false }) => {
  return (
    <div className="flex items-center gap-6">
      <Link to="/" className="flex flex-col items-start">
        <div className="flex items-center gap-1">
          <span className="font-bold text-xl text-primary">Spy</span>
          <Search className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground leading-tight">Advanced Trading AI</span>
      </Link>
      
      {!minimal && (
        <nav className="hidden md:flex gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <Link to="/trades" className="text-muted-foreground hover:text-foreground">Trades</Link>
          <Link to="/performance" className="text-muted-foreground hover:text-foreground">Performance</Link>
          <Link to="/detailed-performance" className="text-muted-foreground hover:text-foreground">Analytics</Link>
          <Link to="/risk-console" className="text-muted-foreground hover:text-foreground">Risk Console</Link>
          <Link to="/schwab-integration" className="text-muted-foreground hover:text-foreground">Schwab Connect</Link>
          <Link to="/ibkr-integration" className="text-muted-foreground hover:text-foreground">IBKR Connect</Link>
        </nav>
      )}
    </div>
  );
};

export default LogoAndNav;
