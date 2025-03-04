
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRAccounts } from '../useIBKRAccounts';
import { getIBKRAccounts } from '@/services/ibkrService';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/services/ibkrService');
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));

describe('useIBKRAccounts', () => {
  const mockToast = jest.fn();
  
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  test('should initialize with empty accounts array', () => {
    const { result } = renderHook(() => useIBKRAccounts());
    
    expect(result.current.accounts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should fetch accounts successfully', async () => {
    const mockAccounts = [
      {
        id: 'test-id-1',
        accountId: 'U12345678',
        accountName: 'Test Account',
        accountType: 'Individual',
        currency: 'USD',
        isPrimary: true
      }
    ];
    
    (getIBKRAccounts as jest.Mock).mockResolvedValue(mockAccounts);
    
    const { result } = renderHook(() => useIBKRAccounts());
    
    await act(async () => {
      await result.current.fetchAccounts();
    });
    
    expect(result.current.accounts).toEqual(mockAccounts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle fetch accounts error', async () => {
    const error = new Error('Failed to fetch accounts');
    (getIBKRAccounts as jest.Mock).mockRejectedValue(error);
    
    const { result } = renderHook(() => useIBKRAccounts());
    
    await act(async () => {
      await result.current.fetchAccounts();
    });
    
    expect(result.current.accounts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch accounts');
    expect(mockToast).toHaveBeenCalled();
  });

  test('should set loading state during fetching', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (getIBKRAccounts as jest.Mock).mockReturnValue(promise);
    
    const { result } = renderHook(() => useIBKRAccounts());
    
    const fetchPromise = act(async () => {
      result.current.fetchAccounts();
    });
    
    // Check that loading state is true while promise is pending
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the promise
    act(() => {
      resolvePromise([]);
    });
    
    await fetchPromise;
    
    expect(result.current.isLoading).toBe(false);
  });
});
