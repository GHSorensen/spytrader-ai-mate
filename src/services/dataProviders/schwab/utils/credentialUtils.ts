
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";

/**
 * Save Schwab credentials to localStorage
 */
export function saveSchawbCredentials(config: {
  apiKey: string;
  secretKey: string;
  callbackUrl?: string;
  paperTrading?: boolean;
}): void {
  const existingConfig = localStorage.getItem('schwab-config');
  const currentConfig: DataProviderConfig = existingConfig 
    ? JSON.parse(existingConfig)
    : { type: 'schwab' };
  
  // Update with new credentials
  const updatedConfig: DataProviderConfig = {
    ...currentConfig,
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    callbackUrl: config.callbackUrl || currentConfig.callbackUrl || window.location.origin + '/auth/schwab',
    paperTrading: config.paperTrading !== undefined ? config.paperTrading : currentConfig.paperTrading
  };
  
  // Save to localStorage
  localStorage.setItem('schwab-config', JSON.stringify(updatedConfig));
  console.log('Schwab credentials saved successfully');
}

/**
 * Get Schwab credentials from localStorage
 */
export function getSchwabCredentials(): DataProviderConfig | null {
  const config = localStorage.getItem('schwab-config');
  if (!config) return null;
  
  try {
    return JSON.parse(config) as DataProviderConfig;
  } catch (error) {
    console.error('Error parsing Schwab config:', error);
    return null;
  }
}

/**
 * Clear Schwab credentials from localStorage
 */
export function clearSchwabCredentials(): void {
  localStorage.removeItem('schwab-config');
  console.log('Schwab credentials cleared');
}
