
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRConnectionMonitoring } from '../useIBKRConnectionMonitoring';
import { getIBKRConnectionStatus } from '@/services/ibkrService';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/services/ibkrService');
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));

// Mock timers for interval testing
jest.useFakeTimers();

describe('useIBKRConnectionMonitoring', () => {
  const mockSetConnectionStatus = jest.fn();
  const mockToast = jest.fn();
  
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => 
      useIBKRConnectionMonitoring(mockSetConnectionStatus)
    );
    
    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.lastChecked).toBeNull();
  });

  test('should start monitoring and check connection immediately', async () => {
    const { result } = renderHook(() => 
      useIBKRConnectionMonitoring(mockSetConnectionStatus)
    );
    
    (getIBKRConnectionStatus as jest.Mock).mockResolvedValue('connected');
    
    act(() => {
      result.current.startMonitoring();
    });
    
    expect(result.current.isMonitoring).toBe(true);
    expect(getIBKRConnectionStatus).toHaveBeenCalledTimes(1);
    
    // Fast-forward to trigger interval
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    
    expect(getIBKRConnectionStatus).toHaveBeenCalledTimes(2);
  });

  test('should stop monitoring when requested', () => {
    const { result } = renderHook(() => 
      useIBKRConnectionMonitoring(mockSetConnectionStatus)
    );
    
    act(() => {
      result.current.startMonitoring();
    });
    
    expect(result.current.isMonitoring).toBe(true);
    
    act(() => {
      result.current.stopMonitoring();
    });
    
    expect(result.current.isMonitoring).toBe(false);
  });

  test('should check connection status and update lastChecked', async () => {
    const { result } = renderHook(() => 
      useIBKRConnectionMonitoring(mockSetConnectionStatus)
    );
    
    (getIBKRConnectionStatus as jest.Mock).mockResolvedValue('connected');
    
    await act(async () => {
      await result.current.checkConnectionStatus();
    });
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connected');
    expect(result.current.lastChecked).not.toBeNull();
  });

  test('should handle connection check failures', async () => {
    const { result } = renderHook(() => 
      useIBKRConnectionMonitoring(mockSetConnectionStatus)
    );
    
    const error = new Error('Connection failed');
    (getIBKRConnectionStatus as jest.Mock).mockRejectedValue(error);
    
    await act(async () => {
      const status = await result.current.checkConnectionStatus();
      expect(status).toBe('error');
    });
    
    expect(mockToast).toHaveBeenCalled();
  });

  test('should clean up interval on unmount', () => {
    const { result, unmount } = renderHook(() => 
      useIBKRConnectionMonitoring(mockSetConnectionStatus)
    );
    
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    act(() => {
      result.current.startMonitoring();
    });
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
