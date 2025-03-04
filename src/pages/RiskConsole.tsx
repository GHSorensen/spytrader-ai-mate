
import React, { useState } from 'react';
import { RiskHeader } from '../components/spy/risk-console/RiskHeader';
import { MainTabs } from '../components/spy/risk-console/MainTabs';
import { Footer } from '../components/spy/risk-console/Footer';
import { DemoNotifications } from '../components/spy/risk-console/DemoNotifications';
import { useRiskMonitoring } from '../hooks/useRiskMonitoring';

const RiskConsole: React.FC = () => {
  const [autoMode, setAutoMode] = useState(false);
  const { performRiskMonitoring, isLoading } = useRiskMonitoring();
  
  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <RiskHeader
          autoMode={autoMode}
          isLoading={isLoading}
          toggleAutoMode={toggleAutoMode}
          performRiskMonitoring={performRiskMonitoring}
        />
        
        <MainTabs />
        
        <Footer />
        
        <DemoNotifications />
      </div>
    </div>
  );
};

export default RiskConsole;
