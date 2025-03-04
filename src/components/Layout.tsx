
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
          
          {/* Directly implemented mobile menu instead of using the problematic component */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px] py-6 px-4">
                <div className="flex flex-col space-y-1 mt-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2 px-2">Navigation</div>
                  <Link 
                    to="/" 
                    className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/data-providers" 
                    className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Data Providers
                  </Link>
                  <Link 
                    to="/interactive-brokers" 
                    className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Interactive Brokers
                  </Link>
                  <Link 
                    to="/td-ameritrade" 
                    className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    TD Ameritrade
                  </Link>
                  <Link 
                    to="/ibkr" 
                    className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    IBKR Integration
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
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
