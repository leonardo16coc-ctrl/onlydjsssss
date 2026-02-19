/**
 * Geonode Proxy Integration Test
 * Validates that Geonode credentials are correct and proxies are working
 */

import { describe, it, expect } from 'vitest';
import { proxyManager } from './scrapers/proxy-manager';

describe('Geonode Proxy Integration', () => {
  it('should detect Geonode credentials from environment', () => {
    const config = proxyManager.getProxyConfig();
    
    expect(config).toBeDefined();
    expect(config?.provider).toBe('geonode');
    expect(config?.host).toBe('proxy.geonode.io');
    expect(config?.port).toBe(9000);
    expect(config?.username).toBeDefined();
    expect(config?.password).toBeDefined();
  });

  it('should generate valid proxy URL with Geonode credentials', () => {
    const proxyUrl = proxyManager.getProxyUrl();
    
    expect(proxyUrl).toBeDefined();
    expect(proxyUrl).toContain('proxy.geonode.io:9000');
    expect(proxyUrl).toContain('geonode_');
  });

  it('should generate sticky session URL for Geonode', () => {
    const proxyUrl = proxyManager.getProxyUrlWithSession();
    
    expect(proxyUrl).toBeDefined();
    expect(proxyUrl).toContain('proxy.geonode.io:9000');
    expect(proxyUrl).toContain('-session-');
  });

  it('should have correct provider priority (Geonode first)', () => {
    const currentProvider = proxyManager.getCurrentProvider();
    
    expect(currentProvider).toBe('geonode');
  });

  it('should track proxy statistics', () => {
    // Get initial stats
    const stats = proxyManager.getStats();
    const geonodeStats = stats.find(s => s.provider === 'geonode');
    
    expect(geonodeStats).toBeDefined();
    expect(geonodeStats?.isHealthy).toBe(true);
  });

  it('should format Geonode credentials correctly for authentication', () => {
    const username = process.env.GEONODE_USERNAME;
    const password = process.env.GEONODE_PASSWORD;
    
    expect(username).toBeDefined();
    expect(username).toContain('geonode_');
    expect(password).toBeDefined();
    expect(password).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/); // UUID format
  });
});
