
import React from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  return (
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
              to="/trades" 
              className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trades
            </Link>
            <Link 
              to="/performance" 
              className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Performance
            </Link>
            <Link 
              to="/risk-console" 
              className="text-sm px-2 py-1.5 hover:bg-accent rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Risk Console
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
  );
};

export default MobileMenu;
