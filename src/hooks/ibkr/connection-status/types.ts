
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

export interface ConnectionLogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

export interface UseIBKRConnectionStatusReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  connectionDiagnostics: ConnectionDiagnostics | null;
  checkConnection: () => Promise<void>;
  reconnect: () => Promise<boolean>;
  lastSuccessfulConnection: Date | null;
  lastCheckTime: Date | null;
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
  connectionLogs: ConnectionLogEntry[];
  handleManualReconnect: () => Promise<void>;
  forceConnectionCheck: () => Promise<void>;
  getDetailedDiagnostics: () => any;
}
