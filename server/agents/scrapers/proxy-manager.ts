/**
 * Proxy Manager
 * Manages residential proxies from multiple providers (Bright Data, Smartproxy, Oxylabs)
 * Handles rotation, health checks, and fallback strategies
 */

// Proxy manager uses process.env directly for configuration

export type ProxyProvider = 'brightdata' | 'smartproxy' | 'oxylabs' | 'geonode' | 'none';

export interface ProxyConfig {
  provider: ProxyProvider;
  host: string;
  port: number;
  username?: string;
  password?: string;
  sessionId?: string;
}

export interface ProxyStats {
  provider: ProxyProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsed: Date | null;
  isHealthy: boolean;
}

/**
 * Proxy configurations for different providers
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. BRIGHT DATA (formerly Luminati)
 *    - Sign up at https://brightdata.com
 *    - Create a Residential Proxy zone
 *    - Get credentials from dashboard
 *    - Set environment variables:
 *      BRIGHTDATA_USERNAME=brd-customer-<customer_id>-zone-<zone_name>
 *      BRIGHTDATA_PASSWORD=<your_password>
 *    - Proxy format: brd.superproxy.io:22225
 *    - Cost: ~$500/month for 20GB
 * 
 * 2. SMARTPROXY
 *    - Sign up at https://smartproxy.com
 *    - Go to Dashboard > Residential Proxies
 *    - Get credentials
 *    - Set environment variables:
 *      SMARTPROXY_USERNAME=<username>
 *      SMARTPROXY_PASSWORD=<password>
 *    - Proxy format: gate.smartproxy.com:7000
 *    - Cost: ~$75/month for 8GB
 * 
 * 3. OXYLABS
 *    - Sign up at https://oxylabs.io
 *    - Create Residential Proxies subscription
 *    - Get credentials from dashboard
 *    - Set environment variables:
 *      OXYLABS_USERNAME=<username>
 *      OXYLABS_PASSWORD=<password>
 *    - Proxy format: pr.oxylabs.io:7777
 *    - Cost: ~$300/month for 20GB
 * 
 * 4. GEONODE (RECOMMENDED - MOST AFFORDABLE) ⭐
 *    - Sign up at https://geonode.com
 *    - Get credentials from dashboard
 *    - Set environment variables:
 *      GEONODE_USERNAME=<username>
 *      GEONODE_PASSWORD=<password>
 *    - Proxy format: proxy.geonode.io:9000
 *    - Cost: $50/month for 50GB (Starter plan) - 10x cheaper than Smartproxy!
 *    - Promotion: New users get DOUBLE bandwidth on first purchase
 *    - Quality: 99% success rate, 500ms avg latency, 200+ countries
 *    - Bandwidth rollover: Unused GB carries over while subscription active
 */

class ProxyManager {
  private stats: Map<ProxyProvider, ProxyStats> = new Map();
  private currentProvider: ProxyProvider = 'none';
  private sessionCounter: number = 0;
  
  constructor() {
    this.initializeStats();
    this.selectBestProvider();
  }
  
  private initializeStats() {
    const providers: ProxyProvider[] = ['brightdata', 'smartproxy', 'oxylabs', 'geonode', 'none'];
    providers.forEach(provider => {
      this.stats.set(provider, {
        provider,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        lastUsed: null,
        isHealthy: true
      });
    });
  }
  
  /**
   * Select the best available proxy provider based on configuration
   */
  private selectBestProvider() {
    // Check Geonode first (most affordable, recommended)
    if (process.env.GEONODE_USERNAME && process.env.GEONODE_PASSWORD) {
      this.currentProvider = 'geonode';
      console.log('[ProxyManager] ⭐ Using Geonode proxies (most affordable option)');
      return;
    }
    
    // Check Smartproxy
    if (process.env.SMARTPROXY_USERNAME && process.env.SMARTPROXY_PASSWORD) {
      this.currentProvider = 'smartproxy';
      console.log('[ProxyManager] Using Smartproxy proxies');
      return;
    }
    
    // Check Oxylabs
    if (process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD) {
      this.currentProvider = 'oxylabs';
      console.log('[ProxyManager] Using Oxylabs proxies');
      return;
    }
    
    // Check Bright Data (most expensive, but highest quality)
    if (process.env.BRIGHTDATA_USERNAME && process.env.BRIGHTDATA_PASSWORD) {
      this.currentProvider = 'brightdata';
      console.log('[ProxyManager] Using Bright Data proxies');
      return;
    }
    
    // No proxy configured
    this.currentProvider = 'none';
    console.warn('[ProxyManager] ⚠️  No proxy service configured. Scraping without proxies is HIGH RISK.');
  }
  
  /**
   * Get current proxy configuration
   */
  getProxyConfig(): ProxyConfig | null {
    if (this.currentProvider === 'none') {
      return null;
    }
    
    const config = this.getProviderConfig(this.currentProvider);
    
    // Update stats
    const stats = this.stats.get(this.currentProvider)!;
    stats.totalRequests++;
    stats.lastUsed = new Date();
    
    return config;
  }
  
  /**
   * Get proxy configuration for a specific provider
   */
  private getProviderConfig(provider: ProxyProvider): ProxyConfig {
    switch (provider) {
      case 'brightdata':
        return {
          provider: 'brightdata',
          host: 'brd.superproxy.io',
          port: 22225,
          username: process.env.BRIGHTDATA_USERNAME!,
          password: process.env.BRIGHTDATA_PASSWORD!,
          sessionId: this.generateSessionId()
        };
      
      case 'smartproxy':
        return {
          provider: 'smartproxy',
          host: 'gate.smartproxy.com',
          port: 7000,
          username: process.env.SMARTPROXY_USERNAME!,
          password: process.env.SMARTPROXY_PASSWORD!,
          sessionId: this.generateSessionId()
        };
      
      case 'oxylabs':
        return {
          provider: 'oxylabs',
          host: 'pr.oxylabs.io',
          port: 7777,
          username: process.env.OXYLABS_USERNAME!,
          password: process.env.OXYLABS_PASSWORD!,
          sessionId: this.generateSessionId()
        };
      
      case 'geonode':
        return {
          provider: 'geonode',
          host: 'proxy.geonode.io',
          port: 9000,
          username: process.env.GEONODE_USERNAME!,
          password: process.env.GEONODE_PASSWORD!,
          sessionId: this.generateSessionId()
        };
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
  
  /**
   * Generate unique session ID for sticky sessions
   * This ensures we get the same IP for multiple requests
   */
  private generateSessionId(): string {
    this.sessionCounter++;
    return `session_${Date.now()}_${this.sessionCounter}`;
  }
  
  /**
   * Get proxy URL in format: http://username:password@host:port
   */
  getProxyUrl(): string | null {
    const config = this.getProxyConfig();
    if (!config) return null;
    
    const auth = config.username && config.password
      ? `${config.username}:${config.password}@`
      : '';
    
    return `http://${auth}${config.host}:${config.port}`;
  }
  
  /**
   * Get proxy URL with session ID for sticky sessions
   * Format varies by provider:
   * - Bright Data: username-session-<id>
   * - Smartproxy: username-session-<id>
   * - Oxylabs: customer-<username>-sessid-<id>
   */
  getProxyUrlWithSession(): string | null {
    const config = this.getProxyConfig();
    if (!config) return null;
    
    let username = config.username!;
    
    // Add session ID to username based on provider
    switch (config.provider) {
      case 'brightdata':
      case 'smartproxy':
      case 'geonode':
        username = `${username}-session-${config.sessionId}`;
        break;
      case 'oxylabs':
        username = `customer-${username}-sessid-${config.sessionId}`;
        break;
    }
    
    return `http://${username}:${config.password}@${config.host}:${config.port}`;
  }
  
  /**
   * Report success for current provider
   */
  reportSuccess() {
    if (this.currentProvider === 'none') return;
    
    const stats = this.stats.get(this.currentProvider)!;
    stats.successfulRequests++;
    stats.isHealthy = true;
  }
  
  /**
   * Report failure for current provider
   */
  reportFailure() {
    if (this.currentProvider === 'none') return;
    
    const stats = this.stats.get(this.currentProvider)!;
    stats.failedRequests++;
    
    // Mark as unhealthy if failure rate > 50%
    const failureRate = stats.failedRequests / stats.totalRequests;
    if (failureRate > 0.5 && stats.totalRequests > 10) {
      stats.isHealthy = false;
      console.warn(`[ProxyManager] ⚠️  ${this.currentProvider} marked as unhealthy (${(failureRate * 100).toFixed(1)}% failure rate)`);
      
      // Try to switch to another provider
      this.switchToHealthyProvider();
    }
  }
  
  /**
   * Switch to a healthy provider if available
   */
  private switchToHealthyProvider() {
    const providers: ProxyProvider[] = ['brightdata', 'smartproxy', 'oxylabs'];
    
    for (const provider of providers) {
      if (provider === this.currentProvider) continue;
      
      const stats = this.stats.get(provider);
      if (stats && stats.isHealthy && this.isProviderConfigured(provider)) {
        console.log(`[ProxyManager] Switching from ${this.currentProvider} to ${provider}`);
        this.currentProvider = provider;
        return;
      }
    }
    
    console.warn('[ProxyManager] ⚠️  No healthy proxy provider available. Continuing with current provider.');
  }
  
  /**
   * Check if a provider is configured
   */
  private isProviderConfigured(provider: ProxyProvider): boolean {
    switch (provider) {
      case 'brightdata':
        return !!(process.env.BRIGHTDATA_USERNAME && process.env.BRIGHTDATA_PASSWORD);
      case 'smartproxy':
        return !!(process.env.SMARTPROXY_USERNAME && process.env.SMARTPROXY_PASSWORD);
      case 'oxylabs':
        return !!(process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD);
      default:
        return false;
    }
  }
  
  /**
   * Get statistics for all providers
   */
  getStats(): ProxyStats[] {
    return Array.from(this.stats.values());
  }
  
  /**
   * Get current provider name
   */
  getCurrentProvider(): ProxyProvider {
    return this.currentProvider;
  }
  
  /**
   * Force switch to a specific provider
   */
  switchProvider(provider: ProxyProvider) {
    if (provider === 'none' || this.isProviderConfigured(provider)) {
      this.currentProvider = provider;
      console.log(`[ProxyManager] Manually switched to ${provider}`);
    } else {
      throw new Error(`Provider ${provider} is not configured`);
    }
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    this.initializeStats();
    console.log('[ProxyManager] Statistics reset');
  }
  
  /**
   * Get health status
   */
  getHealthStatus() {
    const currentStats = this.stats.get(this.currentProvider);
    const configuredProviders = ['brightdata', 'smartproxy', 'oxylabs'].filter(p => 
      this.isProviderConfigured(p as ProxyProvider)
    );
    
    return {
      currentProvider: this.currentProvider,
      isUsingProxy: this.currentProvider !== 'none',
      configuredProviders,
      currentStats,
      allStats: this.getStats()
    };
  }
}

// Singleton instance
export const proxyManager = new ProxyManager();
