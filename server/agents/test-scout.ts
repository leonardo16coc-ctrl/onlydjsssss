/**
 * Test script for Agent Scout
 * Run with: tsx server/agents/test-scout.ts
 */

import { discoverDJsByGenre } from './scout';

async function main() {
  console.log('🧪 Testing Agent Scout...\n');
  
  try {
    // Test with Tech House genre
    const result = await discoverDJsByGenre('Tech House', 'soundcloud', 10);
    
    console.log('\n✅ Test completed successfully!');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
