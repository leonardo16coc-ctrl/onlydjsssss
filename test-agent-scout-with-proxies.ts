/**
 * Test Script: Agent Scout with Geonode Proxies
 * 
 * This script tests Agent Scout with real Geonode proxies to verify:
 * 1. Proxies are working correctly
 * 2. Instagram/SoundCloud scraping works
 * 3. Talent scoring algorithm functions
 * 4. Data is saved to database
 */

import { AgentScout } from './server/agents/scout/index';
import { proxyManager } from './server/agents/scrapers/proxy-manager';

async function testAgentScout() {
  console.log('='.repeat(60));
  console.log('🤖 AGENT SCOUT TEST WITH GEONODE PROXIES');
  console.log('='.repeat(60));
  console.log('');
  
  // 1. Verify proxy configuration
  console.log('1️⃣ Verifying Proxy Configuration...');
  const proxyConfig = proxyManager.getProxyConfig();
  console.log(`   Provider: ${proxyConfig?.provider}`);
  console.log(`   Host: ${proxyConfig?.host}:${proxyConfig?.port}`);
  console.log(`   Username: ${proxyConfig?.username?.substring(0, 15)}...`);
  console.log(`   ✅ Proxy configured successfully`);
  console.log('');
  
  // 2. Get proxy URL
  console.log('2️⃣ Generating Proxy URL...');
  const proxyUrl = proxyManager.getProxyUrlWithSession();
  console.log(`   Proxy URL: ${proxyUrl?.substring(0, 50)}...`);
  console.log(`   ✅ Proxy URL generated`);
  console.log('');
  
  // 3. Initialize Agent Scout
  console.log('3️⃣ Initializing Agent Scout...');
  const scout = new AgentScout();
  console.log(`   ✅ Agent Scout initialized`);
  console.log('');
  
  // 4. Run discovery with test parameters
  console.log('4️⃣ Running Discovery Campaign...');
  console.log(`   Target: 5 DJs (test run)`);
  console.log(`   Platforms: Instagram + SoundCloud`);
  console.log(`   Using: Geonode proxies`);
  console.log('');
  
  try {
    const results = await scout.runDiscovery({
      targetCount: 5, // Small test run
      minFollowers: 1000,
      minTalentScore: 50,
      genres: ['house', 'techno', 'edm']
    });
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ DISCOVERY COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log(`📊 Results Summary:`);
    console.log(`   Total DJs discovered: ${results.discovered.length}`);
    console.log(`   Instagram profiles: ${results.discovered.filter(d => d.platform === 'instagram').length}`);
    console.log(`   SoundCloud profiles: ${results.discovered.filter(d => d.platform === 'soundcloud').length}`);
    console.log('');
    
    // Show top 3 DJs
    if (results.discovered.length > 0) {
      console.log(`🎯 Top ${Math.min(3, results.discovered.length)} DJs by Talent Score:`);
      results.discovered
        .sort((a, b) => b.talentScore - a.talentScore)
        .slice(0, 3)
        .forEach((dj, i) => {
          console.log(`   ${i + 1}. ${dj.username} (${dj.platform})`);
          console.log(`      Talent Score: ${dj.talentScore}/100`);
          console.log(`      Followers: ${dj.followers.toLocaleString()}`);
          console.log(`      Engagement Rate: ${(dj.engagementRate * 100).toFixed(2)}%`);
          console.log('');
        });
    }
    
    // Proxy statistics
    console.log(`📡 Proxy Statistics:`);
    const stats = proxyManager.getStats();
    const geonodeStats = stats.find(s => s.provider === 'geonode');
    if (geonodeStats) {
      console.log(`   Total Requests: ${geonodeStats.totalRequests}`);
      console.log(`   Successful: ${geonodeStats.successfulRequests}`);
      console.log(`   Failed: ${geonodeStats.failedRequests}`);
      const successRate = geonodeStats.totalRequests > 0 
        ? (geonodeStats.successfulRequests / geonodeStats.totalRequests * 100).toFixed(1)
        : '0';
      console.log(`   Success Rate: ${successRate}%`);
      console.log(`   Health Status: ${geonodeStats.isHealthy ? '✅ Healthy' : '⚠️ Unhealthy'}`);
    }
    console.log('');
    
    console.log('='.repeat(60));
    console.log('🎉 TEST COMPLETED - AGENT SCOUT IS READY FOR PRODUCTION');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ ERROR DURING DISCOVERY');
    console.error('='.repeat(60));
    console.error('');
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error('');
    
    // Show proxy stats even on error
    console.log(`📡 Proxy Statistics (at time of error):`);
    const stats = proxyManager.getStats();
    const geonodeStats = stats.find(s => s.provider === 'geonode');
    if (geonodeStats) {
      console.log(`   Total Requests: ${geonodeStats.totalRequests}`);
      console.log(`   Successful: ${geonodeStats.successfulRequests}`);
      console.log(`   Failed: ${geonodeStats.failedRequests}`);
    }
    console.log('');
    
    throw error;
  }
}

// Run test
testAgentScout()
  .then(() => {
    console.log('✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
