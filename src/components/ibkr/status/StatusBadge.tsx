
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface StatusBadgeProps {
  isAuthenticated: boolean;
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  onClick: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  isAuthenticated, 
  isConnected, 
  dataSource, 
  onClick 
}) => {
  // Get appropriate badge color and icon based on status
  const getBadgeProps = () => {
    if (!isAuthenticated) {
      return {
        variant: "outline" as const,
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        text: "Not Signed In"
      };
    }
    
    if (!isConnected) {
      return {
        variant: "destructive" as const,
        icon: <WifiOff className="h-3 w-3 mr-1" />,
        text: "Disconnected"
      };
    }
    
    if (dataSource === 'live') {
      return {
        variant: "default" as const,
        icon: <Wifi className="h-3 w-3 mr-1" />,
        text: "Live Data"
      };
    }
    
    if (dataSource === 'delayed') {
      return {
        variant: "secondary" as const,
        icon: <Clock className="h-3 w-3 mr-1" />,
        text: "Delayed Data"
      };
    }
    
    return {
      variant: "secondary" as const,
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      text: "Mock Data"
    };
  };

  const badgeProps = getBadgeProps();
  
  return (
    <Badge 
      variant={badgeProps.variant}
      className="cursor-pointer"
      onClick={onClick}
    >
      {badgeProps.icon}
      {badgeProps.text}
    </Badge>
  );
};

export default StatusBadge;
