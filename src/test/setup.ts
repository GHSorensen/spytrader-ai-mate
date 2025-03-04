
// Set up test environment
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset mocks after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Note: We've removed the duplicate Mock interface definition
// since it's now defined in jest.d.ts

