
import React from 'react';
import { LogoAndNav } from './header/LogoAndNav';
import { HeaderActions } from './header/HeaderActions';
import { MobileMenu } from './header/MobileMenu';

interface SpyHeaderWithNotificationsProps {
  userProfile?: any; // User profile data
  minimal?: boolean; // Add minimal prop for AuthenticationPage
}

export const SpyHeaderWithNotifications: React.FC<SpyHeaderWithNotificationsProps> = ({ 
  userProfile,
  minimal = false 
}) => {
  // Display actual user name if available, otherwise fallback to defaults
  const userName = userProfile?.username || userProfile?.name || "User";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex justify-between items-center w-full">
      <LogoAndNav minimal={minimal} />
      <HeaderActions userName={userName} />
      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </div>
  );
};

SpyHeaderWithNotifications.displayName = "SpyHeaderWithNotifications";
