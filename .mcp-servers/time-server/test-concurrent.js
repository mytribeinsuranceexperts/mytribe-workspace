/**
 * Test concurrent requests to HTTP time server
 * Simulates subagent concurrent load
 */

async function testConcurrentRequests(count = 10) {
  console.log(`\nTesting ${count} concurrent requests to time server...`);

  const startTime = Date.now();

  // Create concurrent promises
  const promises = Array.from({ length: count }, (_, i) =>
    fetch('http://localhost:8082/health')
      .then(res => res.json())
      .then(data => ({ success: true, index: i, data }))
      .catch(err => ({ success: false, index: i, error: err.message }))
  );

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;

  // Analyze results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const failureRate = (failed / count * 100).toFixed(1);
  const avgTime = (duration / count).toFixed(2);

  console.log(`\nResults:`);
  console.log(`✅ Successful: ${successful}/${count}`);
  console.log(`❌ Failed: ${failed}/${count} (${failureRate}% failure rate)`);
  console.log(`⏱️  Total time: ${duration}ms`);
  console.log(`📊 Avg time per request: ${avgTime}ms`);
  console.log(`🔥 Requests/second: ${(count / (duration / 1000)).toFixed(2)}`);

  if (failureRate > 0) {
    console.log(`\n⚠️  FAILURES DETECTED - Server may not be handling concurrent load`);
  } else {
    console.log(`\n✅ ALL REQUESTS SUCCEEDED - HTTP transport working!`);
  }

  return { successful, failed, failureRate, duration };
}

// Run tests with increasing concurrency
async function runTests() {
  console.log('='.repeat(60));
  console.log('HTTP Time Server Concurrency Test');
  console.log('='.repeat(60));

  await testConcurrentRequests(5);   // Light load
  await testConcurrentRequests(10);  // Medium load
  await testConcurrentRequests(20);  // Heavy load

  console.log('\n' + '='.repeat(60));
  console.log('Test complete!');
  console.log('='.repeat(60));
}

runTests().catch(console.error);
