
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

// Mock the InteractiveBrokersService with proper typing
const mockConnect = jest.fn().mockResolvedValue(true);
const MockInteractiveBrokersService = jest.fn().mockImplementation(() => {
  return {
    connect: mockConnect,
  };
});

jest.mock('@/services/dataProviders/interactiveBrokersService', () => ({
  InteractiveBrokersService: jest.fn().mockImplementation(() => {
    return {
      connect: jest.fn().mockResolvedValue(true),
    };
  }),
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
    // Force the mock implementation for this test
    (InteractiveBrokersService as jest.Mock).mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(true),
      };
    });
    
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
    const mockServiceConstructor = InteractiveBrokersService as jest.Mock;
    expect(mockServiceConstructor.mock.calls[0][0]).toEqual({
      type: 'interactive-brokers' as DataProviderType,
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      connectionMethod: 'webapi',
      paperTrading: false
    });
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connected');
    expect(mockSetIsConfigured).toHaveBeenCalledWith(true);
    expect(toast.success).toHaveBeenCalled();
    expect(clearDataProvider).toHaveBeenCalled();
    expect(getDataProvider).toHaveBeenCalled();
  });

  test('should test connection with current TWS settings', async () => {
    // Force the mock implementation for this test
    (InteractiveBrokersService as jest.Mock).mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(true),
      };
    });
    
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
    const mockServiceConstructor = InteractiveBrokersService as jest.Mock;
    expect(mockServiceConstructor.mock.calls[0][0]).toEqual({
      type: 'interactive-brokers' as DataProviderType,
      twsHost: '127.0.0.1',
      twsPort: '7496',
      connectionMethod: 'tws',
      paperTrading: true
    });
  });

  test('should use saved config if available', async () => {
    const savedConfig = {
      type: 'interactive-brokers' as DataProviderType,
      apiKey: 'saved-key',
      callbackUrl: 'saved-callback',
      connectionMethod: 'webapi' as 'webapi',
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
    
    // Force the mock implementation for this test
    (InteractiveBrokersService as jest.Mock).mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(true),
      };
    });
    
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
    const mockServiceConstructor = InteractiveBrokersService as jest.Mock;
    expect(mockServiceConstructor.mock.calls[0][0]).toEqual(savedConfig);
  });

  test('should handle connection failure', async () => {
    // Override the mock to simulate connection failure
    (InteractiveBrokersService as jest.Mock).mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(false),
      };
    });
    
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
    // Override the mock to simulate error
    (InteractiveBrokersService as jest.Mock).mockImplementation(() => {
      return {
        connect: jest.fn().mockRejectedValue(new Error('Connection error')),
      };
    });
    
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
