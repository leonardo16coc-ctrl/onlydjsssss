/**
 * K6 Load Test: 100 Concurrent Users
 * Tests download and streaming performance
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const downloadDuration = new Trend('download_duration');
const streamingStartTime = new Trend('streaming_start_time');

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up to 20 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests should be below 2s
    'errors': ['rate<0.1'],              // Error rate should be below 10%
    'http_req_failed': ['rate<0.05'],    // Failed requests should be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Homepage load
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Explore page with tracks
  const exploreRes = http.get(`${BASE_URL}/explore`);
  check(exploreRes, {
    'explore page status is 200': (r) => r.status === 200,
    'explore page loads in < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(2);

  // Test 3: API - Get tracks list
  const tracksRes = http.get(`${BASE_URL}/api/trpc/tracks.getAll?input={"json":{"limit":20,"offset":0}}`);
  check(tracksRes, {
    'tracks API status is 200': (r) => r.status === 200,
    'tracks API responds in < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Simulate audio streaming (if track exists)
  // Note: This requires a valid track ID - adjust based on your data
  const trackId = 1; // Replace with actual track ID
  const streamRes = http.get(`${BASE_URL}/api/tracks/${trackId}/stream`, {
    headers: {
      'Range': 'bytes=0-1048575', // Request first 1MB
    },
  });
  
  if (streamRes.status === 200 || streamRes.status === 206) {
    streamingStartTime.add(streamRes.timings.waiting);
    check(streamRes, {
      'streaming starts in < 2s': (r) => r.timings.waiting < 2000,
    });
  }

  sleep(3);

  // Test 5: Download limits check (for authenticated users)
  const limitsRes = http.get(`${BASE_URL}/api/trpc/downloads.getDownloadLimits`);
  check(limitsRes, {
    'download limits API responds': (r) => r.status === 200 || r.status === 401,
    'download limits API fast': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'load-test-100-users-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors !== false;
  
  let summary = '\n';
  summary += `${indent}Test Summary:\n`;
  summary += `${indent}  Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += `${indent}  Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  Error Rate: ${(data.metrics.errors?.values.rate || 0) * 100}%\n`;
  
  return summary;
}
