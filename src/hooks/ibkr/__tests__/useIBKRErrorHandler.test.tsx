
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
    
    const testError = new Error('Test error') as ClassifiedError;
    testError.errorType = 'TEST_ERROR';
    testError.service = 'test-service';
    testError.method = 'test-method';
    
    act(() => {
      result.current.setInternalErrors([testError]);
    });
    
    expect(result.current.internalErrors).toEqual([testError]);
  });

  test('getActiveError should prioritize lastError', () => {
    const { result } = renderHook(() => useIBKRErrorHandler());
    
    const testError1 = new Error('Last error') as ClassifiedError;
    testError1.errorType = 'LAST_ERROR';
    testError1.service = 'test-service';
    testError1.method = 'test-method';
    
    const testError2 = new Error('Market data error') as ClassifiedError;
    testError2.errorType = 'MARKET_DATA_ERROR';
    testError2.service = 'market-data';
    testError2.method = 'fetch';
    
    const testError3 = new Error('Internal error') as ClassifiedError;
    testError3.errorType = 'INTERNAL_ERROR';
    testError3.service = 'internal';
    testError3.method = 'process';
    
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
    
    const testError1 = new Error('Market data error') as ClassifiedError;
    testError1.errorType = 'MARKET_DATA_ERROR';
    testError1.service = 'market-data';
    testError1.method = 'fetch';
    
    const testError2 = new Error('Internal error') as ClassifiedError;
    testError2.errorType = 'INTERNAL_ERROR';
    testError2.service = 'internal';
    testError2.method = 'process';
    
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
    
    const testError1 = new Error('Options error') as ClassifiedError;
    testError1.errorType = 'OPTIONS_ERROR';
    testError1.service = 'options';
    testError1.method = 'fetch';
    
    const testError2 = new Error('Internal error') as ClassifiedError;
    testError2.errorType = 'INTERNAL_ERROR';
    testError2.service = 'internal';
    testError2.method = 'process';
    
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
    
    const testError = new Error('Internal error') as ClassifiedError;
    testError.errorType = 'INTERNAL_ERROR';
    testError.service = 'internal';
    testError.method = 'process';
    
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
