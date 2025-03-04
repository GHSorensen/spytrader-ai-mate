
import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  LineChart, 
  Wallet,
  Clock
} from 'lucide-react';
import { NotificationType } from '@/services/notification/notificationService';

// Function to get the icon for a notification type
export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'trade_execution':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'security_alert':
      return <ShieldAlert className="h-5 w-5 text-red-500" />;
    case 'capital_warning':
      return <Wallet className="h-5 w-5 text-amber-500" />;
    case 'portfolio_balance':
      return <LineChart className="h-5 w-5 text-blue-500" />;
    case 'risk_alert':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'anomaly_detected':
      return <AlertTriangle className="h-5 w-5 text-purple-500" />;
    case 'system_message':
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};
