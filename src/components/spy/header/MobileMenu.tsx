
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    // Close the menu first, then navigate
    setIsMobileMenuOpen(false);
    
    // Add a small delay before navigation to ensure the menu closing animation completes
    setTimeout(() => {
      navigate(path);
    }, 100);
  };
  
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px] py-6 px-4">
        <div className="flex flex-col space-y-1 mt-6">
          <div className="text-sm font-medium text-muted-foreground mb-2 px-2">Navigation</div>
          <Button
            variant="ghost"
            className="justify-start text-sm px-2 py-1.5 h-auto font-normal hover:bg-accent"
            onClick={() => handleNavigation('/')}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-sm px-2 py-1.5 h-auto font-normal hover:bg-accent"
            onClick={() => handleNavigation('/data-providers')}
          >
            Data Providers
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-sm px-2 py-1.5 h-auto font-normal hover:bg-accent"
            onClick={() => handleNavigation('/interactive-brokers')}
          >
            Interactive Brokers
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-sm px-2 py-1.5 h-auto font-normal hover:bg-accent"
            onClick={() => handleNavigation('/td-ameritrade')}
          >
            TD Ameritrade
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-sm px-2 py-1.5 h-auto font-normal hover:bg-accent"
            onClick={() => handleNavigation('/ibkr')}
          >
            IBKR Integration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
