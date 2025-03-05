
import { DataProviderInterface } from "@/lib/types/spy/dataProvider";

/**
 * Safely extracts configuration properties from a data provider
 * with proper type checking to avoid runtime errors
 * 
 * @param provider The data provider to extract configuration from
 * @param propertyName The name of the configuration property to extract
 * @returns The configuration property value or undefined if not available
 */
export function getProviderConfigProperty<T = any>(
  provider: DataProviderInterface | null | undefined,
  propertyName: string
): T | undefined {
  if (!provider) {
    return undefined;
  }
  
  // Check if config exists and is an object
  if (
    'config' in provider && 
    provider.config && 
    typeof provider.config === 'object'
  ) {
    return (provider.config as any)[propertyName] as T;
  }
  
  return undefined;
}

/**
 * Extracts connection method from provider config with type safety
 * 
 * @param provider The data provider
 * @returns The connection method or undefined if not valid
 */
export function getConnectionMethod(
  provider: DataProviderInterface | null | undefined
): "webapi" | "tws" | undefined {
  const connectionMethod = getProviderConfigProperty<string>(provider, 'connectionMethod');
  
  return (connectionMethod === 'webapi' || connectionMethod === 'tws') 
    ? connectionMethod 
    : undefined;
}

/**
 * Gets paper trading status from provider config
 * 
 * @param provider The data provider
 * @returns Boolean indicating if paper trading is enabled or undefined
 */
export function getPaperTradingStatus(
  provider: DataProviderInterface | null | undefined
): boolean | undefined {
  return getProviderConfigProperty<boolean>(provider, 'paperTrading');
}

/**
 * Extracts common provider configuration properties used for error handling
 * 
 * @param provider The data provider
 * @returns An object containing connectionMethod and paperTrading properties
 */
export function getProviderErrorContext(provider: DataProviderInterface | null | undefined): {
  connectionMethod: "webapi" | "tws" | undefined;
  paperTrading: boolean | undefined;
} {
  return {
    connectionMethod: getConnectionMethod(provider),
    paperTrading: getPaperTradingStatus(provider)
  };
}
