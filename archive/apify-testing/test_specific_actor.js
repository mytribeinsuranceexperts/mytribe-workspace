/**
 * Test Specific Apify Actor for Circle Health
 * Actor ID: ChNuXurElMWvpbJB9
 */

require('dotenv').config();
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'ChNuXurElMWvpbJB9';

const TEST_HOSPITAL = {
  name: 'The Beardwood Hospital',
  url: 'https://www.circlehealthgroup.co.uk/hospitals/the-beardwood-hospital/treatments-prices'
};

if (!APIFY_API_TOKEN) {
  console.error('❌ Error: APIFY_API_TOKEN not found');
  process.exit(1);
}

async function testActor() {
  console.log('='.repeat(60));
  console.log('Testing Actor: ' + ACTOR_ID);
  console.log('Hospital: ' + TEST_HOSPITAL.name);
  console.log('URL: ' + TEST_HOSPITAL.url);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Start the actor run
    console.log('🚀 Starting actor...');

    const runResponse = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      },
      body: JSON.stringify({
        startUrls: [{ url: TEST_HOSPITAL.url }],
        // Add any default input parameters the actor might need
        maxRequestsPerCrawl: 1,
        proxyConfiguration: {
          useApifyProxy: true
        }
      })
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`API error: ${runResponse.status} - ${errorText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log(`✅ Run started: ${runId}`);
    console.log(`🔗 View in console: https://console.apify.com/actors/runs/${runId}`);
    console.log('');
    console.log('⏳ Waiting for completion (max 2 minutes)...');
    console.log('');

    // Poll for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }}
      );

      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;

      if (attempts % 3 === 0) {
        console.log(`  ⏱️  Still running... (${attempts * 5}s elapsed)`);
      }
    }

    console.log('');

    if (status === 'SUCCEEDED') {
      console.log('✅ Run SUCCEEDED');
    } else if (status === 'FAILED') {
      console.log('❌ Run FAILED');
    } else if (status === 'RUNNING') {
      console.log('⏰ Run TIMEOUT (still running after 2 minutes)');
    } else {
      console.log(`⚠️  Run status: ${status}`);
    }

    console.log('');
    console.log('📊 Fetching results...');
    console.log('');

    // Get results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}/dataset/items`,
      { headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }}
    );

    const results = await resultsResponse.json();

    console.log(`📦 Results count: ${results.length}`);
    console.log('');

    if (results.length === 0) {
      console.log('⚠️  No results returned');
      return;
    }

    // Display results
    console.log('='.repeat(60));
    console.log('RESULT DATA');
    console.log('='.repeat(60));
    console.log('');

    const result = results[0];

    // Pretty print the result
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Save full results
    const outputPath = 'Research/actor-test-result.json';
    fs.writeFileSync(outputPath, JSON.stringify({
      actor: ACTOR_ID,
      hospital: TEST_HOSPITAL,
      runId: runId,
      status: status,
      results: results
    }, null, 2));

    console.log('='.repeat(60));
    console.log(`💾 Full results saved to: ${outputPath}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testActor();
