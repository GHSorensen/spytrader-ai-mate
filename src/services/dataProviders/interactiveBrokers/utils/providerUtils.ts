
import { DataProviderInterface } from "@/lib/types/spy/dataProvider";

/**
 * Safely extracts configuration properties from a data provider
 * with proper type checking to avoid runtime errors
 * 
 * @param provider The data provider to extract configuration from
 * @param propertyName The name of the configuration property to extract
 * @returns The configuration property value or undefined if not available
 */
export function getProviderConfigProperty(
  provider: DataProviderInterface | null | undefined,
  propertyName: string
): any | undefined {
  if (!provider) {
    return undefined;
  }
  
  // Check if config exists and is an object
  if (
    'config' in provider && 
    provider.config && 
    typeof provider.config === 'object'
  ) {
    return (provider.config as any)[propertyName];
  }
  
  return undefined;
}

/**
 * Extracts common provider configuration properties used for error handling
 * 
 * @param provider The data provider
 * @returns An object containing connectionMethod and paperTrading properties
 */
export function getProviderErrorContext(provider: DataProviderInterface | null | undefined): {
  connectionMethod: string | undefined;
  paperTrading: boolean | undefined;
} {
  return {
    connectionMethod: getProviderConfigProperty(provider, 'connectionMethod'),
    paperTrading: getProviderConfigProperty(provider, 'paperTrading')
  };
}
