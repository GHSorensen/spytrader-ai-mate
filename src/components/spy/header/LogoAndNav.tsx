
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoAndNavProps {
  minimal?: boolean;
}

export const LogoAndNav: React.FC<LogoAndNavProps> = ({ minimal = false }) => {
  return (
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
  );
};

export default LogoAndNav;
