
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRTestHandlers } from '../useIBKRTestHandlers';
import { toast } from 'sonner';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { clearDataProvider, getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { DataProviderType } from '@/lib/types/spy/dataProvider';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Create a properly typed mock for InteractiveBrokersService
const mockConnectFn = jest.fn().mockResolvedValue(true);
const MockInteractiveBrokersService = jest.fn().mockImplementation(() => {
  return {
    connect: mockConnectFn,
  };
});

// Mock the InteractiveBrokersService with our typed mock
jest.mock('@/services/dataProviders/interactiveBrokersService', () => ({
  InteractiveBrokersService: MockInteractiveBrokersService,
}));

jest.mock('@/services/dataProviders/dataProviderFactory', () => ({
  clearDataProvider: jest.fn(),
  getDataProvider: jest.fn(),
}));

describe('useIBKRTestHandlers', () => {
  const mockSetConnectionStatus = jest.fn();
  const mockSetIsConfigured = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
      },
      writable: true
    });
  });

  test('should test connection with current web API settings', async () => {
    // Reset mock to return a successful connection
    mockConnectFn.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useIBKRTestHandlers({
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      twsHost: '',
      twsPort: '',
      isPaperTrading: false,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured
    }));
    
    await result.current.handleTestConnection();
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connecting');
    
    // Check service was initialized with correct config
    expect(MockInteractiveBrokersService.mock.calls[0][0]).toEqual({
      type: 'interactive-brokers' as DataProviderType,
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      connectionMethod: 'webapi' as 'webapi' | 'tws',
      paperTrading: false
    });
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connected');
    expect(mockSetIsConfigured).toHaveBeenCalledWith(true);
    expect(toast.success).toHaveBeenCalled();
    expect(clearDataProvider).toHaveBeenCalled();
    expect(getDataProvider).toHaveBeenCalled();
  });

  test('should test connection with current TWS settings', async () => {
    // Reset mock to return a successful connection
    mockConnectFn.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useIBKRTestHandlers({
      apiKey: '',
      callbackUrl: '',
      twsHost: '127.0.0.1',
      twsPort: '7496',
      isPaperTrading: true,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured
    }));
    
    await result.current.handleTestConnection();
    
    // Check service was initialized with correct config
    expect(MockInteractiveBrokersService.mock.calls[0][0]).toEqual({
      type: 'interactive-brokers' as DataProviderType,
      twsHost: '127.0.0.1',
      twsPort: '7496',
      connectionMethod: 'tws' as 'webapi' | 'tws',
      paperTrading: true
    });
  });

  test('should use saved config if available', async () => {
    const savedConfig = {
      type: 'interactive-brokers' as DataProviderType,
      apiKey: 'saved-key',
      callbackUrl: 'saved-callback',
      connectionMethod: 'webapi' as 'webapi' | 'tws',
      paperTrading: true
    };
    
    // Mock localStorage to return saved config
    const getItemMock = jest.fn().mockReturnValue(JSON.stringify(savedConfig));
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemMock,
        setItem: jest.fn(),
      },
      writable: true
    });
    
    // Reset mock to return a successful connection
    mockConnectFn.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useIBKRTestHandlers({
      apiKey: 'new-key',
      callbackUrl: 'new-callback',
      twsHost: '',
      twsPort: '',
      isPaperTrading: false,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured
    }));
    
    await result.current.handleTestConnection();
    
    // Should use saved config
    expect(MockInteractiveBrokersService.mock.calls[0][0]).toEqual(savedConfig);
  });

  test('should handle connection failure', async () => {
    // Reset mock to return a failed connection
    mockConnectFn.mockResolvedValueOnce(false);
    
    const { result } = renderHook(() => useIBKRTestHandlers({
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      twsHost: '',
      twsPort: '',
      isPaperTrading: false,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured
    }));
    
    await result.current.handleTestConnection();
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('error');
    expect(toast.error).toHaveBeenCalled();
  });

  test('should handle connection errors', async () => {
    // Reset mock to throw an error
    mockConnectFn.mockRejectedValueOnce(new Error('Connection error'));
    
    const { result } = renderHook(() => useIBKRTestHandlers({
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      twsHost: '',
      twsPort: '',
      isPaperTrading: false,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured
    }));
    
    await result.current.handleTestConnection();
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('error');
    expect(toast.error).toHaveBeenCalled();
  });
});
