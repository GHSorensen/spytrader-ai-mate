
import { ReactNode } from 'react';

export interface ConnectionDiagnostics {
  timestamp: string;
  providerType: string;
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
    timeZone: string;
  };
  connected?: boolean;
  status?: any;
  dataSource?: 'live' | 'delayed' | 'mock';
  error?: string;
  stack?: string;
}

export interface ConnectionHistoryEvent {
  timestamp: Date;
  event: 'connected' | 'disconnected' | 'reconnect_attempt' | 'reconnect_success' | 'reconnect_failure';
  details?: string;
}

export interface UseIBKRConnectionStatusReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  connectionDiagnostics: ConnectionDiagnostics | null;
  checkConnection: () => Promise<void>;
  reconnect: () => Promise<boolean>;
}

export interface UseIBKRConnectionMonitorOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  onStatusChange?: (status: { isConnected: boolean; dataSource: 'live' | 'delayed' | 'mock' }) => void;
}

export interface UseIBKRConnectionMonitorReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  isReconnecting: boolean;
  reconnectAttempts: number;
  connectionLostTime: Date | null;
  connectionHistory: ConnectionHistoryEvent[];
  handleManualReconnect: () => Promise<void>;
  forceConnectionCheck: () => Promise<void>;
  getDetailedDiagnostics: () => any;
}
