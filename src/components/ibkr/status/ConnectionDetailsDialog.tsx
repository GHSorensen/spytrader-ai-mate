
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RefreshCcw } from "lucide-react";

interface ConnectionDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  status: {
    connected: boolean;
    errorMessage: string | null;
    quotesDelayed: boolean;
    lastChecked: Date;
  };
  dataSource: 'live' | 'delayed' | 'mock';
  lastUpdated?: Date;
  isRefreshing: boolean;
  onReconnect: () => void;
}

export const formatTime = (date?: Date) => {
  if (!date) return "Never";
  return date.toLocaleTimeString();
};

export const ConnectionDetailsDialog: React.FC<ConnectionDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  isAuthenticated,
  status,
  dataSource,
  lastUpdated,
  isRefreshing,
  onReconnect
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interactive Brokers Connection Status</DialogTitle>
          <DialogDescription>
            Details about your connection to Interactive Brokers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!isAuthenticated ? (
            <div className="bg-yellow-100 p-3 rounded-md text-yellow-800 text-sm">
              <span className="font-medium">Not signed in. </span>
              Please sign in to connect to Interactive Brokers.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-medium">Connection Status:</span>
              <span>{status.connected ? "Connected" : "Disconnected"}</span>
              
              <span className="font-medium">Data Type:</span>
              <span className="capitalize">{dataSource}</span>
              
              <span className="font-medium">Last Updated:</span>
              <span>{formatTime(lastUpdated)}</span>
              
              <span className="font-medium">Last Status Check:</span>
              <span>{formatTime(status.lastChecked)}</span>
            </div>
          )}
          
          {status.errorMessage && (
            <div className="bg-red-100 p-3 rounded-md text-red-800 text-sm">
              <span className="font-medium">Error: </span>
              {status.errorMessage}
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isAuthenticated && (
              <Button 
                onClick={onReconnect} 
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Reconnect</>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDetailsDialog;
