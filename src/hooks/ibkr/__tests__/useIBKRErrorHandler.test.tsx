
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRErrorHandler } from '../useIBKRErrorHandler';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

describe('useIBKRErrorHandler', () => {
  test('should initialize with empty internal errors', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    expect(result.current.internalErrors).toEqual([]);
  });

  test('should allow adding internal errors', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError: ClassifiedError = {
      message: 'Test error',
      code: 'TEST_ERROR',
      service: 'test-service',
      method: 'test-method'
    };
    
    act(() => {
      result.current.setInternalErrors([testError]);
    });
    
    expect(result.current.internalErrors).toEqual([testError]);
  });

  test('getActiveError should prioritize lastError', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError1: ClassifiedError = {
      message: 'Last error',
      code: 'LAST_ERROR',
      service: 'test-service',
      method: 'test-method'
    };
    
    const testError2: ClassifiedError = {
      message: 'Market data error',
      code: 'MARKET_DATA_ERROR',
      service: 'market-data',
      method: 'fetch'
    };
    
    const testError3: ClassifiedError = {
      message: 'Internal error',
      code: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    };
    
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
    
    const testError1: ClassifiedError = {
      message: 'Market data error',
      code: 'MARKET_DATA_ERROR',
      service: 'market-data',
      method: 'fetch'
    };
    
    const testError2: ClassifiedError = {
      message: 'Internal error',
      code: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    };
    
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
    
    const testError1: ClassifiedError = {
      message: 'Options error',
      code: 'OPTIONS_ERROR',
      service: 'options',
      method: 'fetch'
    };
    
    const testError2: ClassifiedError = {
      message: 'Internal error',
      code: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    };
    
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
    
    const testError: ClassifiedError = {
      message: 'Internal error',
      code: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    };
    
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
