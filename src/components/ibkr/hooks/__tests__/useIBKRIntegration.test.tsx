
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRIntegration } from '../useIBKRIntegration';

// Mock the dependencies
jest.mock('../ibkr-connection/useIBKRConnectionMonitoring', () => ({
  useIBKRConnectionMonitoring: jest.fn().mockReturnValue({
    isMonitoring: false,
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    checkConnectionStatus: jest.fn(),
    lastChecked: null
  }),
}));

jest.mock('../ibkr-accounts/useIBKRAccounts', () => ({
  useIBKRAccounts: jest.fn().mockReturnValue({
    accounts: [],
    isLoading: false,
    error: null,
    fetchAccounts: jest.fn(),
  }),
}));

jest.mock('../ibkr-config/useIBKRConfig', () => ({
  useIBKRConfig: jest.fn().mockReturnValue({
    apiMethod: 'webapi',
    setApiMethod: jest.fn(),
    apiKey: '',
    setApiKey: jest.fn(),
    callbackUrl: 'http://localhost:3000/auth/ibkr/callback',
    setCallbackUrl: jest.fn(),
    twsHost: '127.0.0.1',
    setTwsHost: jest.fn(),
    twsPort: '7496',
    setTwsPort: jest.fn(),
    isPaperTrading: false,
    setIsPaperTrading: jest.fn(),
    isConfigured: false,
    setIsConfigured: jest.fn(),
  }),
}));

jest.mock('../ibkr-integration/useIBKRIntegrationState', () => ({
  useIBKRIntegrationState: jest.fn().mockReturnValue({
    connectionStatus: 'disconnected',
    setConnectionStatus: jest.fn(),
    isConnecting: false,
    setIsConnecting: jest.fn(),
  }),
}));

jest.mock('../ibkr-integration/useIBKRConnectionActions', () => ({
  useIBKRConnectionActions: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

jest.mock('../ibkr-integration/useIBKRMonitoring', () => ({
  useIBKRMonitoring: jest.fn().mockReturnValue({
    accounts: [],
    accountsLoading: false,
    accountsError: null,
    isMonitoring: false,
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    checkConnectionStatus: jest.fn(),
  }),
}));

describe('useIBKRIntegration', () => {
  test('should return combined state from all hooks', () => {
    const { result } = renderHook(() => useIBKRIntegration());
    
    expect(result.current).toEqual({
      connectionStatus: 'disconnected',
      isConnecting: false,
      accounts: [],
      isLoading: false,
      error: null,
      apiMethod: 'webapi',
      apiKey: '',
      callbackUrl: 'http://localhost:3000/auth/ibkr/callback',
      twsHost: '127.0.0.1',
      twsPort: '7496',
      isPaperTrading: false,
      isConfigured: false,
      // Check that functions exist
      connect: expect.any(Function),
      disconnect: expect.any(Function),
      setIsConnecting: expect.any(Function),
      setConnectionStatus: expect.any(Function),
      setApiMethod: expect.any(Function),
      setApiKey: expect.any(Function),
      setCallbackUrl: expect.any(Function),
      setTwsHost: expect.any(Function),
      setTwsPort: expect.any(Function),
      setIsPaperTrading: expect.any(Function),
      setIsConfigured: expect.any(Function),
    });
  });
});
