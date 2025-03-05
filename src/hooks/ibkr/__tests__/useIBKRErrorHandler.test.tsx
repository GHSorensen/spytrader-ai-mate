
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
      errorType: 'TEST_ERROR',
      service: 'test-service',
      method: 'test-method'
    } as ClassifiedError;
    
    act(() => {
      result.current.setInternalErrors([testError]);
    });
    
    expect(result.current.internalErrors).toEqual([testError]);
  });

  test('getActiveError should prioritize lastError', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError1: ClassifiedError = {
      message: 'Last error',
      errorType: 'LAST_ERROR',
      service: 'test-service',
      method: 'test-method'
    } as ClassifiedError;
    
    const testError2: ClassifiedError = {
      message: 'Market data error',
      errorType: 'MARKET_DATA_ERROR',
      service: 'market-data',
      method: 'fetch'
    } as ClassifiedError;
    
    const testError3: ClassifiedError = {
      message: 'Internal error',
      errorType: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    } as ClassifiedError;
    
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
      errorType: 'MARKET_DATA_ERROR',
      service: 'market-data',
      method: 'fetch'
    } as ClassifiedError;
    
    const testError2: ClassifiedError = {
      message: 'Internal error',
      errorType: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    } as ClassifiedError;
    
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
      errorType: 'OPTIONS_ERROR',
      service: 'options',
      method: 'fetch'
    } as ClassifiedError;
    
    const testError2: ClassifiedError = {
      message: 'Internal error',
      errorType: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    } as ClassifiedError;
    
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
      errorType: 'INTERNAL_ERROR',
      service: 'internal',
      method: 'process'
    } as ClassifiedError;
    
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
