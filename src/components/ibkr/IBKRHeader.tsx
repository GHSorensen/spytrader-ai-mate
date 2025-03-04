
import React from 'react';
import { Link } from 'react-router-dom';
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const IBKRHeader: React.FC = () => {
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
    <header className="border-b">
      <div className="container py-4 flex justify-between items-center">
        <SpyHeaderWithNotifications />
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default IBKRHeader;
