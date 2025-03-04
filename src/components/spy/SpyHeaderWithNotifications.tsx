
import React, { useState, useEffect } from 'react';
import { LogoAndNav } from './header/LogoAndNav';
import { HeaderActions } from './header/HeaderActions';
import { MobileMenu } from './header/MobileMenu';
import { supabase } from '@/integrations/supabase/client';

export interface SpyHeaderWithNotificationsProps {
  userProfile?: any; // User profile data
  minimal?: boolean; // For AuthenticationPage
  setIsAISettingsOpen?: (open: boolean) => void;
}

export const SpyHeaderWithNotifications: React.FC<SpyHeaderWithNotificationsProps> = ({ 
  userProfile,
  minimal = false,
  setIsAISettingsOpen
}) => {
  // Display actual user name if available, otherwise fallback to defaults
  const [userName, setUserName] = useState<string>(userProfile?.username || userProfile?.name || "User");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check for session on component mount
  useEffect(() => {
    const fetchUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session?.user?.email && (!userProfile || !userProfile.username)) {
        setUserName(data.session.user.email.split('@')[0] || "User");
      }
    };
    
    fetchUserSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (session?.user?.email) {
        setUserName(session.user.email.split('@')[0] || "User");
      } else {
        setUserName("User");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userProfile]);

  return (
    <div className="flex justify-between items-center w-full">
      <LogoAndNav minimal={minimal} />
      <HeaderActions 
        userName={userName} 
        setIsAISettingsOpen={setIsAISettingsOpen}
        isAuthenticated={isAuthenticated}
      />
      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </div>
  );
};

SpyHeaderWithNotifications.displayName = "SpyHeaderWithNotifications";
