
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NotificationCenter } from '../notifications';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeaderActionsProps {
  userName?: string;
  setIsAISettingsOpen?: (open: boolean) => void; 
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ 
  userName = "User",
  setIsAISettingsOpen 
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <User className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
            {userName && (
              <span className="absolute -bottom-1 -right-1 text-xs font-medium bg-primary text-primary-foreground rounded-full px-1.5 hidden md:block">
                {userName.substring(0, 1)}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="w-full cursor-pointer">
              Profile Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NotificationCenter />
      
      {setIsAISettingsOpen && (
        <Button variant="ghost" size="icon" onClick={() => setIsAISettingsOpen(true)}>
          <span className="sr-only">AI Settings</span>
          <Settings className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default HeaderActions;
