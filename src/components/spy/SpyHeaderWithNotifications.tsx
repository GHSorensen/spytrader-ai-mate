
import React, { useState } from 'react';
import { LogoAndNav } from './header/LogoAndNav';
import { HeaderActions } from './header/HeaderActions';
import { MobileMenu } from './header/MobileMenu';

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
  const userName = userProfile?.username || userProfile?.name || "User";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center w-full">
      <LogoAndNav minimal={minimal} />
      <HeaderActions 
        userName={userName} 
        setIsAISettingsOpen={setIsAISettingsOpen}
      />
      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </div>
  );
};

SpyHeaderWithNotifications.displayName = "SpyHeaderWithNotifications";
