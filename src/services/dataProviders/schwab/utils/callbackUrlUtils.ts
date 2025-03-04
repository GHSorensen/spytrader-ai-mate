
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { toast } from "@/components/ui/use-toast";

/**
 * Ensures the callbackUrl is properly set for Schwab's HTTPS requirement
 */
export function ensureSecureCallbackUrl(config: DataProviderConfig): string {
  // If a valid HTTPS callback URL is already set, use it
  if (config.callbackUrl && config.callbackUrl.startsWith('https://')) {
    return config.callbackUrl;
  }
  
  console.warn('[callbackUrlUtils] Schwab requires HTTPS for callback URLs. Updating config with secure URL.');
  
  // Use the current origin if in production, or development placeholder otherwise
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const callbackPath = '/auth/callback';
  
  let secureCallbackUrl: string;
  
  if (origin && (origin.startsWith('https://') || origin.includes('render.com'))) {
    // In production or Render deployment, use the actual window origin
    secureCallbackUrl = origin + callbackPath;
    console.log(`[callbackUrlUtils] Using production domain for callback URL: ${secureCallbackUrl}`);
  } else {
    // In development, use a placeholder or localhost with forced HTTPS
    secureCallbackUrl = 'https://spy-v2.onrender.com/auth/callback';
    console.log('[callbackUrlUtils] Using production placeholder for callback URL.');
  }
  
  // Show a toast to notify the user about the callback URL
  toast({
    title: "Callback URL Notice",
    description: `Using ${secureCallbackUrl} for Schwab authentication.`,
  });
  
  return secureCallbackUrl;
}
