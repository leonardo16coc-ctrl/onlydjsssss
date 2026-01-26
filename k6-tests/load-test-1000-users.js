/**
 * K6 Stress Test: 1000 Concurrent Users
 * Tests system limits and breaking points
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const downloadDuration = new Trend('download_duration');
const streamingStartTime = new Trend('streaming_start_time');
const totalRequests = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm up: ramp to 100 users
    { duration: '3m', target: 300 },   // Ramp to 300 users
    { duration: '3m', target: 600 },   // Ramp to 600 users
    { duration: '3m', target: 1000 },  // Ramp to 1000 users (STRESS)
    { duration: '5m', target: 1000 },  // Stay at 1000 users for 5 minutes
    { duration: '3m', target: 500 },   // Ramp down to 500
    { duration: '2m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // 95% of requests should be below 5s (relaxed for stress test)
    'errors': ['rate<0.2'],              // Error rate should be below 20% (relaxed)
    'http_req_failed': ['rate<0.15'],    // Failed requests should be below 15% (relaxed)
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  totalRequests.add(1);

  // Randomize user behavior
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% - Browse and explore
    browseScenario();
  } else if (scenario < 0.7) {
    // 30% - Stream audio
    streamingScenario();
  } else {
    // 30% - Check download limits and stats
    downloadScenario();
  }

  // Random sleep between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

function browseScenario() {
  // Homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage loads': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Explore page
  const exploreRes = http.get(`${BASE_URL}/explore`);
  check(exploreRes, {
    'explore page loads': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Get tracks
  const tracksRes = http.get(`${BASE_URL}/api/trpc/tracks.getAll?input={"json":{"limit":20,"offset":0}}`);
  check(tracksRes, {
    'tracks API responds': (r) => r.status === 200,
  }) || errorRate.add(1);
}

function streamingScenario() {
  // Simulate streaming a track
  const trackId = Math.floor(Math.random() * 10) + 1; // Random track ID 1-10
  
  const streamStart = Date.now();
  const streamRes = http.get(`${BASE_URL}/api/tracks/${trackId}/stream`, {
    headers: {
      'Range': 'bytes=0-524288', // Request first 512KB
    },
    timeout: '10s',
  });
  
  if (streamRes.status === 200 || streamRes.status === 206) {
    const startTime = Date.now() - streamStart;
    streamingStartTime.add(startTime);
    check(streamRes, {
      'streaming starts': (r) => r.status === 200 || r.status === 206,
      'streaming starts in < 5s': () => startTime < 5000,
    });
  } else {
    errorRate.add(1);
  }
}

function downloadScenario() {
  // Check download limits
  const limitsRes = http.get(`${BASE_URL}/api/trpc/downloads.getDownloadLimits`);
  check(limitsRes, {
    'download limits API responds': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(1);

  // Get download stats
  const statsRes = http.get(`${BASE_URL}/api/trpc/downloads.getDownloadStats`);
  check(statsRes, {
    'download stats API responds': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);
}

export function handleSummary(data) {
  const summary = {
    testType: 'Stress Test - 1000 Users',
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: data.metrics.total_requests?.values.count || 0,
      failedRequests: data.metrics.http_req_failed?.values.rate || 0,
      errorRate: data.metrics.errors?.values.rate || 0,
      avgResponseTime: data.metrics.http_req_duration?.values.avg || 0,
      p95ResponseTime: data.metrics.http_req_duration?.values['p(95)'] || 0,
      p99ResponseTime: data.metrics.http_req_duration?.values['p(99)'] || 0,
      maxResponseTime: data.metrics.http_req_duration?.values.max || 0,
      requestsPerSecond: data.metrics.http_reqs?.values.rate || 0,
    },
    thresholds: data.thresholds || {},
  };

  return {
    'load-test-1000-users-summary.json': JSON.stringify(summary, null, 2),
    stdout: generateTextSummary(summary),
  };
}

function generateTextSummary(summary) {
  let text = '\n';
  text += '═══════════════════════════════════════════════════════\n';
  text += '  ONLYDJS STRESS TEST RESULTS - 1000 CONCURRENT USERS\n';
  text += '═══════════════════════════════════════════════════════\n\n';
  
  text += `  Test Type: ${summary.testType}\n`;
  text += `  Timestamp: ${summary.timestamp}\n\n`;
  
  text += '  METRICS:\n';
  text += `    Total Requests:      ${summary.metrics.totalRequests}\n`;
  text += `    Failed Requests:     ${(summary.metrics.failedRequests * 100).toFixed(2)}%\n`;
  text += `    Error Rate:          ${(summary.metrics.errorRate * 100).toFixed(2)}%\n`;
  text += `    Requests/Second:     ${summary.metrics.requestsPerSecond.toFixed(2)}\n\n`;
  
  text += '  RESPONSE TIMES:\n';
  text += `    Average:             ${summary.metrics.avgResponseTime.toFixed(2)}ms\n`;
  text += `    P95:                 ${summary.metrics.p95ResponseTime.toFixed(2)}ms\n`;
  text += `    P99:                 ${summary.metrics.p99ResponseTime.toFixed(2)}ms\n`;
  text += `    Max:                 ${summary.metrics.maxResponseTime.toFixed(2)}ms\n\n`;
  
  text += '  VERDICT:\n';
  if (summary.metrics.errorRate < 0.05 && summary.metrics.p95ResponseTime < 3000) {
    text += '    ✅ EXCELLENT - System handles 1000 users smoothly\n';
  } else if (summary.metrics.errorRate < 0.15 && summary.metrics.p95ResponseTime < 5000) {
    text += '    ⚠️  ACCEPTABLE - System stressed but functional\n';
  } else {
    text += '    ❌ CRITICAL - System overloaded, optimization needed\n';
  }
  
  text += '\n═══════════════════════════════════════════════════════\n';
  
  return text;
}
