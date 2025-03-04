
import React from 'react';
import { LogoAndNav } from './header/LogoAndNav';
import { HeaderActions } from './header/HeaderActions';
import { MobileMenu } from './header/MobileMenu';

interface SpyHeaderWithNotificationsProps {
  userProfile?: any; // Add userProfile prop
}

export const SpyHeaderWithNotifications: React.FC<SpyHeaderWithNotificationsProps> = ({ userProfile }) => {
  // Display actual user name if available, otherwise fallback to defaults
  const userName = userProfile?.username || userProfile?.name || "User";

  return (
    <div className="flex justify-between items-center w-full">
      <LogoAndNav />
      <HeaderActions userName={userName} />
      <MobileMenu />
    </div>
  );
};

SpyHeaderWithNotifications.displayName = "SpyHeaderWithNotifications";
