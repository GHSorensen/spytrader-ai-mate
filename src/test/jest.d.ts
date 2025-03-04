
import '@testing-library/jest-dom';

declare global {
  // Add Jest globals to the TypeScript environment
  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: (done?: jest.DoneCallback) => void, timeout?: number) => void;
  const it: typeof test;
  const expect: jest.Expect;
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;
  const beforeAll: (fn: () => void) => void;
  const afterAll: (fn: () => void) => void;
  const jest: jest.Jest;

  namespace jest {
    interface Jest {
      fn: <T = any>(implementation?: (...args: any[]) => T) => Mock<T>;
      spyOn: (object: any, method: string) => Mock;
      mock: (moduleName: string, factory?: any) => void;
      clearAllMocks: () => void;
      resetAllMocks: () => void;
      restoreAllMocks: () => void;
      useFakeTimers: () => void;
      useRealTimers: () => void;
      runAllTimers: () => void;
      advanceTimersByTime: (ms: number) => void;
    }

    type Mock<T = any> = {
      (...args: any[]): T;
      mockImplementation: (fn: (...args: any[]) => T) => Mock<T>;
      mockImplementationOnce: (fn: (...args: any[]) => T) => Mock<T>;
      mockReturnValue: (value: T) => Mock<T>;
      mockReturnValueOnce: (value: T) => Mock<T>;
      mockResolvedValue: (value: T) => Mock<T>;
      mockResolvedValueOnce: (value: T) => Mock<T>;
      mockRejectedValue: (value: any) => Mock<T>;
      mockRejectedValueOnce: (value: any) => Mock<T>;
      mockClear: () => Mock<T>;
      mockReset: () => Mock<T>;
      mockRestore: () => Mock<T>;
      mock: {
        calls: any[][];
        instances: any[];
        results: Array<{ type: string; value: any }>;
      };
    };

    interface Expect {
      (actual: any): any;
      extend(matchers: any): void;
      objectContaining(object: object): any;
      stringContaining(str: string): any;
      arrayContaining(arr: any[]): any;
      stringMatching(str: string | RegExp): any;
      any(constructor: any): any; // Add the missing 'any' property
    }

    interface DoneCallback {
      (...args: any[]): any;
      fail(error?: string | { message: string }): any;
    }
  }
}
