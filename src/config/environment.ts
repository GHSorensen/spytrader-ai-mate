
/**
 * Environment configuration
 * 
 * This module provides environment-specific configuration settings
 * that can be used throughout the application.
 */

type Environment = 'development' | 'production' | 'test';

interface EnvironmentConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  authRedirectUrl: string;
  maxRetryAttempts: number;
  cacheTTL: number; // in seconds
}

// Determine current environment
const getEnvironment = (): Environment => {
  if (import.meta.env.MODE === 'test') return 'test';
  return import.meta.env.PROD ? 'production' : 'development';
};

// Configuration for each environment
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    apiUrl: 'http://localhost:10000',
    supabaseUrl: "https://sklwsxgxsqtwlqjhegms.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbHdzeGd4c3F0d2xxamhlZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDQ5NTEsImV4cCI6MjA1NjQyMDk1MX0.pUI_7m2CPmUyHK9x1ef7b1rWRnSQIeo7KHpYAS9OGHg",
    logLevel: 'debug',
    authRedirectUrl: 'http://localhost:5173/auth',
    maxRetryAttempts: 3,
    cacheTTL: 300, // 5 minutes
  },
  production: {
    apiUrl: 'https://spy-trader.onrender.com',
    supabaseUrl: "https://sklwsxgxsqtwlqjhegms.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbHdzeGd4c3F0d2xxamhlZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDQ5NTEsImV4cCI6MjA1NjQyMDk1MX0.pUI_7m2CPmUyHK9x1ef7b1rWRnSQIeo7KHpYAS9OGHg",
    logLevel: 'error',
    authRedirectUrl: 'https://spy-trader.onrender.com/auth',
    maxRetryAttempts: 5,
    cacheTTL: 1800, // 30 minutes
  },
  test: {
    apiUrl: 'http://localhost:10000',
    supabaseUrl: "https://sklwsxgxsqtwlqjhegms.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbHdzeGd4c3F0d2xxamhlZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDQ5NTEsImV4cCI6MjA1NjQyMDk1MX0.pUI_7m2CPmUyHK9x1ef7b1rWRnSQIeo7KHpYAS9OGHg",
    logLevel: 'debug',
    authRedirectUrl: 'http://localhost:5173/auth',
    maxRetryAttempts: 0,
    cacheTTL: 0, // No caching in test
  }
};

// Export the current environment configuration
const currentEnv = getEnvironment();
export const config = configs[currentEnv];
export const environment = currentEnv;

// Helper function to check if we're in production
export const isProduction = currentEnv === 'production';
export const isDevelopment = currentEnv === 'development';
export const isTest = currentEnv === 'test';
