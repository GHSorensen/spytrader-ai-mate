
import React, { useEffect } from 'react';
import notificationService from '@/services/notification/notificationService';

export const DemoNotifications: React.FC = () => {
  // Demo function to create sample notifications when the page loads
  useEffect(() => {
    // Portfolio balance notification
    notificationService.notifyPortfolioBalance(
      'morning',
      125000,
      1200,
      0.97
    );
    
    // Schedule end of day update (for demo purposes we'll show it immediately)
    setTimeout(() => {
      notificationService.notifyPortfolioBalance(
        'end_of_day',
        126500,
        2700,
        2.18
      );
    }, 5000);
    
    // Demo risk alert (after 10 seconds)
    setTimeout(() => {
      notificationService.notifyRiskAlert(
        'high',
        'Unusual volatility detected in the market. Consider adjusting position sizes.',
        { volatilityIndex: 32.5, normalRange: "15-25" }
      );
    }, 10000);
  }, []);

  return null; // This component doesn't render anything
};
