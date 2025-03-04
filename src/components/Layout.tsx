
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link to="/" className="text-xl font-bold">SPY Trader</Link>
            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm ${isActive('/') || isActive('/dashboard') ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/data-providers" 
              className={`text-sm ${isActive('/data-providers') ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Data Providers
            </Link>
            <Link 
              to="/interactive-brokers" 
              className={`text-sm ${isActive('/interactive-brokers') ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Interactive Brokers
            </Link>
            <Link 
              to="/td-ameritrade" 
              className={`text-sm ${isActive('/td-ameritrade') ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              TD Ameritrade
            </Link>
            <Link 
              to="/ibkr" 
              className={`text-sm ${isActive('/ibkr') ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              IBKR Integration
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="p-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SPY Trader AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
