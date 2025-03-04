import { DataProviderConfig } from "@/lib/types/spy/dataProvider";

/**
 * Updates the callback URL for production environments
 */
export function getProductionCallbackUrl(config: DataProviderConfig): string {
  // Get current domain
  const isProd = typeof window !== 'undefined' && 
                window.location.hostname !== 'localhost' && 
                !window.location.hostname.includes('127.0.0.1');
  
  // In production, use the actual domain
  if (isProd) {
    // Handle Render.com deployment specifically
    if (window.location.hostname.includes('render.com')) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/auth/callback`;
    }
    // Other production domains
    return `${window.location.origin}/auth/callback`;
  }
  
  // In development, use a placeholder or localhost
  return config.callbackUrl || 'https://localhost:8080/auth/callback';
}

/**
 * Updates the config with production-ready callback URL
 */
export function updateConfigForProduction(config: DataProviderConfig): DataProviderConfig {
  // Clone the config to avoid modifying the original
  const updatedConfig = { ...config };
  
  // Update the callback URL
  updatedConfig.callbackUrl = getProductionCallbackUrl(config);
  
  console.log(`[productionCallbackUtils] Updated callback URL for production: ${updatedConfig.callbackUrl}`);
  
  return updatedConfig;
}
