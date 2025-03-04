
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => {
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link 
            to="/" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/trades" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Trades
          </Link>
          <Link 
            to="/performance" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Performance
          </Link>
          <Link 
            to="/detailed-performance" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Analytics
          </Link>
          <Link 
            to="/risk-console" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Risk Console
          </Link>
          <Link 
            to="/schwab-integration" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Schwab Connect
          </Link>
          <Link 
            to="/profile" 
            className="px-2 py-1 rounded hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Profile
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
