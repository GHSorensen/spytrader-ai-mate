
import { useState } from 'react';
import { Menu, X, Bell, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40 p-4">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <div className="flex items-center">
            <div className="bg-primary/10 text-primary rounded-md p-1 mr-2">
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6" 
                stroke="currentColor" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">SpyTrader AI</h1>
              <p className="text-xs text-muted-foreground leading-none">Automated Options Trading</p>
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
          <a href="#automation" className="text-sm font-medium hover:text-primary transition-colors">Trade Automation</a>
          <a href="#strategy" className="text-sm font-medium hover:text-primary transition-colors">Strategies</a>
          <a href="#performance" className="text-sm font-medium hover:text-primary transition-colors">Performance</a>
          <a href="#settings" className="text-sm font-medium hover:text-primary transition-colors">Settings</a>
        </nav>
        
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Notifications
            </TooltipContent>
          </Tooltip>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 rounded-full">
                <div className="relative w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">User</span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="grid gap-1">
                <Button variant="ghost" className="justify-start text-sm" size="sm">
                  <User size={16} className="mr-2" />
                  Profile
                </Button>
                <Button variant="ghost" className="justify-start text-sm" size="sm">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" className="justify-start text-sm text-destructive" size="sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="p-8 pt-20">
          <nav className="grid gap-6">
            <a 
              href="#dashboard" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="#automation" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Trade Automation
            </a>
            <a 
              href="#strategy" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Strategies
            </a>
            <a 
              href="#performance" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Performance
            </a>
            <a 
              href="#settings" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
