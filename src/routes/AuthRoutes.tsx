
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SchwabCallbackHandler } from '@/components/spy/settings/broker/SchwabCallbackHandler';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/schwab" element={<SchwabCallbackHandler />} />
      {/* Additional auth routes can be added here */}
    </Routes>
  );
};

export default AuthRoutes;
