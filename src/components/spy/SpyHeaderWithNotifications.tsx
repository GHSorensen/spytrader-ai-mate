
import React, { useState } from 'react';
import { AISettingsDialog } from './AISettingsDialog';
import { RiskToleranceType } from '@/lib/types/spy';
import { LogoAndNav, MobileMenu, HeaderActions } from './header';

interface SpyHeaderProps {
  minimal?: boolean;
}

export const SpyHeaderWithNotifications: React.FC<SpyHeaderProps> = ({ minimal = false }) => {
  // Add state for AI settings dialog
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState<RiskToleranceType>('moderate');

  // Handler for risk tolerance changes
  const handleRiskToleranceChange = (tolerance: RiskToleranceType) => {
    setRiskTolerance(tolerance);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <LogoAndNav minimal={minimal} />
      
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button - only shown on small screens */}
        <MobileMenu 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />

        <HeaderActions setIsAISettingsOpen={setIsAISettingsOpen} />
        
        <AISettingsDialog 
          open={isAISettingsOpen}
          onOpenChange={setIsAISettingsOpen}
          currentRiskTolerance={riskTolerance}
          onRiskToleranceChange={handleRiskToleranceChange}
        />
      </div>
    </div>
  );
};

export default SpyHeaderWithNotifications;
