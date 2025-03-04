
import React from 'react';
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';

const IBKRHeader: React.FC = () => {
  return (
    <header className="border-b">
      <div className="container py-4">
        <SpyHeaderWithNotifications />
      </div>
    </header>
  );
};

export default IBKRHeader;
