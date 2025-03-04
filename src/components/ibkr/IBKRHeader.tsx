
import React from 'react';
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';

const IBKRHeader: React.FC<{ userProfile?: any }> = ({ userProfile }) => {
  return (
    <header className="border-b">
      <div className="container py-4">
        <SpyHeaderWithNotifications userProfile={userProfile} />
      </div>
    </header>
  );
};

export default IBKRHeader;
