
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

// Mock the InteractiveBrokersService with TypeScript compatibility
jest.mock('@/services/dataProviders/interactiveBrokersService', () => {
  const MockInteractiveBrokersService = jest.fn().mockImplementation(() => {
    return {
      connect: jest.fn().mockResolvedValue(true),
    };
  });
  
  return {
    InteractiveBrokersService: MockInteractiveBrokersService,
  };
});

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
    const mockInteractiveBrokers = InteractiveBrokersService as jest.Mock;
    expect(mockInteractiveBrokers.mock.calls[0][0]).toEqual({
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
    const mockInteractiveBrokers = InteractiveBrokersService as jest.Mock;
    expect(mockInteractiveBrokers.mock.calls[0][0]).toEqual({
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
      connectionMethod: 'webapi',
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
    const mockInteractiveBrokers = InteractiveBrokersService as jest.Mock;
    expect(mockInteractiveBrokers.mock.calls[0][0]).toEqual(savedConfig);
  });

  test('should handle connection failure', async () => {
    // Override the mock to simulate connection failure
    const MockFailedService = jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(false),
      };
    });
    (InteractiveBrokersService as unknown as jest.Mock).mockImplementation(MockFailedService);
    
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
    const MockErrorService = jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockRejectedValue(new Error('Connection error')),
      };
    });
    (InteractiveBrokersService as unknown as jest.Mock).mockImplementation(MockErrorService);
    
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
