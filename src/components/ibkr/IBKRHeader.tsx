
import React from 'react';
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';

const IBKRHeader: React.FC<{ userProfile?: any }> = ({ userProfile }) => {
  // We'll use this component but avoid duplicate headers
  // by checking if we're in a nested layout
  const isNestedLayout = window.location.pathname.includes('/ibkr-integration');
  
  if (isNestedLayout) {
    return null; // Don't render duplicate header
  }
  
  return (
    <header className="border-b">
      <div className="container py-4">
        <SpyHeaderWithNotifications userProfile={userProfile} />
      </div>
    </header>
  );
};

export default IBKRHeader;
