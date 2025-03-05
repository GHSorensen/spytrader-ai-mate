
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRErrorHandler } from '../useIBKRErrorHandler';
import { ClassifiedError, ErrorType } from '@/lib/errorMonitoring/types/errorClassification';

// Helper function to create properly typed test errors
const createTestError = (message: string, errorType: ErrorType): ClassifiedError => {
  const error = new Error(message) as ClassifiedError;
  error.errorType = errorType;
  // Add any custom properties as part of IBKRErrorContext
  (error as any).service = 'test-service';
  (error as any).method = 'test-method';
  return error;
};

describe('useIBKRErrorHandler', () => {
  test('should initialize with empty internal errors', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    expect(result.current.internalErrors).toEqual([]);
  });

  test('should allow adding internal errors', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError = createTestError('Test error', ErrorType.UNKNOWN);
    
    act(() => {
      result.current.setInternalErrors([testError]);
    });
    
    expect(result.current.internalErrors).toEqual([testError]);
  });

  test('getActiveError should prioritize lastError', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError1 = createTestError('Last error', ErrorType.API_ERROR);
    (testError1 as any).service = 'test-service';
    (testError1 as any).method = 'test-method';
    
    const testError2 = createTestError('Market data error', ErrorType.INVALID_RESPONSE);
    (testError2 as any).service = 'market-data';
    (testError2 as any).method = 'fetch';
    
    const testError3 = createTestError('Internal error', ErrorType.CLIENT_ERROR);
    (testError3 as any).service = 'internal';
    (testError3 as any).method = 'process';
    
    act(() => {
      result.current.setInternalErrors([testError3]);
    });
    
    const activeError = result.current.getActiveError(
      testError1,
      testError2,
      null
    );
    
    expect(activeError).toEqual(testError1);
  });

  test('getActiveError should use market data error if no lastError', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError1 = createTestError('Market data error', ErrorType.INVALID_RESPONSE);
    (testError1 as any).service = 'market-data';
    (testError1 as any).method = 'fetch';
    
    const testError2 = createTestError('Internal error', ErrorType.CLIENT_ERROR);
    (testError2 as any).service = 'internal';
    (testError2 as any).method = 'process';
    
    act(() => {
      result.current.setInternalErrors([testError2]);
    });
    
    const activeError = result.current.getActiveError(
      null,
      testError1,
      null
    );
    
    expect(activeError).toEqual(testError1);
  });

  test('getActiveError should use options error if no lastError or market data error', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError1 = createTestError('Options error', ErrorType.DATA_CORRUPTED);
    (testError1 as any).service = 'options';
    (testError1 as any).method = 'fetch';
    
    const testError2 = createTestError('Internal error', ErrorType.CLIENT_ERROR);
    (testError2 as any).service = 'internal';
    (testError2 as any).method = 'process';
    
    act(() => {
      result.current.setInternalErrors([testError2]);
    });
    
    const activeError = result.current.getActiveError(
      null,
      null,
      testError1
    );
    
    expect(activeError).toEqual(testError1);
  });

  test('getActiveError should use internal error if no other errors', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError = createTestError('Internal error', ErrorType.CLIENT_ERROR);
    (testError as any).service = 'internal';
    (testError as any).method = 'process';
    
    act(() => {
      result.current.setInternalErrors([testError]);
    });
    
    const activeError = result.current.getActiveError(
      null,
      null,
      null
    );
    
    expect(activeError).toEqual(testError);
  });

  test('getActiveError should return null if no errors', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const activeError = result.current.getActiveError(
      null,
      null,
      null
    );
    
    expect(activeError).toBeNull();
  });
});
