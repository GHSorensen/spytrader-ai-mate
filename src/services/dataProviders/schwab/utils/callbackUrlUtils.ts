
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";

/**
 * Ensure callback URL is HTTPS for production and valid for Schwab
 */
export function ensureSecureCallbackUrl(config: DataProviderConfig): string {
  if (!config.callbackUrl) {
    // Default callback URL if none provided
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/schwab`;
  }
  
  try {
    const url = new URL(config.callbackUrl);
    
    // In production, ensure HTTPS
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      console.warn('[callbackUrlUtils] Forcing HTTPS for callback URL in production');
      url.protocol = 'https:';
    }
    
    return url.toString();
  } catch (error) {
    console.error('[callbackUrlUtils] Invalid callback URL:', config.callbackUrl);
    
    // Return a fallback URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/schwab`;
  }
}
