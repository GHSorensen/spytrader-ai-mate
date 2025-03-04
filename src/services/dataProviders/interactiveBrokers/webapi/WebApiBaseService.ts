
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import * as endpoints from '../endpoints';

/**
 * Base service for IBKR Web API with common functionality
 */
export class WebApiBaseService {
  protected config: DataProviderConfig;
  protected accessToken: string | null = null;
  
  constructor(config: DataProviderConfig, accessToken: string | null = null) {
    this.config = config;
    this.accessToken = accessToken;
  }
  
  /**
   * Set the access token for API requests
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }
  
  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Fetch data from API endpoint
   */
  protected async fetchFromAPI(endpoint: string, params: Record<string, any> = {}) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authenticate with Interactive Brokers.");
    }
    
    const url = new URL(`${endpoints.API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    console.log(`Fetching from IBKR Web API: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`IBKR API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Post data to API endpoint
   */
  protected async postToAPI(endpoint: string, data: Record<string, any> = {}) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authenticate with Interactive Brokers.");
    }
    
    console.log(`Posting to IBKR Web API: ${endpoints.API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${endpoints.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`IBKR API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}
