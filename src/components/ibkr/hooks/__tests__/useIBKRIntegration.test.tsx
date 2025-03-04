
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRIntegration } from '../useIBKRIntegration';

// Mock the dependencies
jest.mock('../ibkr-connection/useIBKRConnection', () => ({
  useIBKRConnection: jest.fn().mockReturnValue({
    connectionStatus: 'disconnected',
    isConnecting: false,
    setIsConnecting: jest.fn(),
    setConnectionStatus: jest.fn(),
    isLoading: false,
    error: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    startMonitoring: jest.fn(),
    isMonitoring: false,
    stopMonitoring: jest.fn(),
    checkConnectionStatus: jest.fn(),
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

describe('useIBKRIntegration', () => {
  test('should return combined state from all hooks', () => {
    const { result } = renderHook(() => useIBKRIntegration());
    
    expect(result.current).toEqual(expect.objectContaining({
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
    }));
    
    // Check that functions exist
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
    expect(typeof result.current.setApiMethod).toBe('function');
    expect(typeof result.current.setApiKey).toBe('function');
    expect(typeof result.current.setCallbackUrl).toBe('function');
    expect(typeof result.current.setTwsHost).toBe('function');
    expect(typeof result.current.setTwsPort).toBe('function');
    expect(typeof result.current.setIsPaperTrading).toBe('function');
    expect(typeof result.current.setIsConfigured).toBe('function');
  });

  test('should start monitoring when configured', () => {
    const startMonitoringMock = jest.fn();
    
    require('../ibkr-connection/useIBKRConnection').useIBKRConnection.mockReturnValue({
      connectionStatus: 'disconnected',
      isConnecting: false,
      setIsConnecting: jest.fn(),
      setConnectionStatus: jest.fn(),
      isLoading: false,
      error: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      startMonitoring: startMonitoringMock,
      isMonitoring: false,
      stopMonitoring: jest.fn(),
      checkConnectionStatus: jest.fn(),
    });
    
    require('../ibkr-config/useIBKRConfig').useIBKRConfig.mockReturnValue({
      apiMethod: 'webapi',
      setApiMethod: jest.fn(),
      apiKey: 'test-key',
      setApiKey: jest.fn(),
      callbackUrl: 'http://localhost:3000/auth/ibkr/callback',
      setCallbackUrl: jest.fn(),
      twsHost: '127.0.0.1',
      setTwsHost: jest.fn(),
      twsPort: '7496',
      setTwsPort: jest.fn(),
      isPaperTrading: false,
      setIsPaperTrading: jest.fn(),
      isConfigured: true,
      setIsConfigured: jest.fn(),
    });
    
    renderHook(() => useIBKRIntegration());
    
    expect(startMonitoringMock).toHaveBeenCalled();
  });

  test('should fetch accounts when connected', () => {
    const fetchAccountsMock = jest.fn();
    
    require('../ibkr-connection/useIBKRConnection').useIBKRConnection.mockReturnValue({
      connectionStatus: 'connected',
      isConnecting: false,
      setIsConnecting: jest.fn(),
      setConnectionStatus: jest.fn(),
      isLoading: false,
      error: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      startMonitoring: jest.fn(),
      isMonitoring: true,
      stopMonitoring: jest.fn(),
      checkConnectionStatus: jest.fn(),
    });
    
    require('../ibkr-accounts/useIBKRAccounts').useIBKRAccounts.mockReturnValue({
      accounts: [],
      isLoading: false,
      error: null,
      fetchAccounts: fetchAccountsMock,
    });
    
    renderHook(() => useIBKRIntegration());
    
    expect(fetchAccountsMock).toHaveBeenCalled();
  });
});
