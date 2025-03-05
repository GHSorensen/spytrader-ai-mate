
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface ReconnectButtonProps {
  isAuthenticated: boolean;
  isRefreshing: boolean;
  onClick: () => void;
}

export const ReconnectButton: React.FC<ReconnectButtonProps> = ({
  isAuthenticated,
  isRefreshing,
  onClick
}) => {
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-6 text-xs"
      onClick={onClick}
      disabled={isRefreshing}
    >
      <RefreshCcw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Connecting...' : 'Reconnect'}
    </Button>
  );
};

export default ReconnectButton;
