
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NotificationCenter } from '../notifications';
import SchwabGuide from './SchwabGuide';
import IBKRGuide from './IBKRGuide';

interface HeaderActionsProps {
  setIsAISettingsOpen: (open: boolean) => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ 
  setIsAISettingsOpen 
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2">
        <SchwabGuide />
        <IBKRGuide />
      </div>
      
      <Link to="/profile">
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">User Profile</span>
        </Button>
      </Link>
      
      <NotificationCenter />
      
      <Button variant="ghost" size="icon" onClick={() => setIsAISettingsOpen(true)}>
        <span className="sr-only">AI Settings</span>
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default HeaderActions;
