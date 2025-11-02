/**
 * Test Cloudflare Web Scraper Actor
 * Actor ID: ChNuXurElMWvpbJB9
 *
 * This actor bypasses Cloudflare protection using residential proxies
 * and custom JavaScript execution to extract pricing data.
 */

require('dotenv').config();
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'ChNuXurElMWvpbJB9';

const TEST_HOSPITAL = {
  name: 'The Beardwood Hospital',
  url: 'https://www.circlehealthgroup.co.uk/hospitals/the-beardwood-hospital/treatments-prices'
};

// JavaScript to run on the page to extract pricing data
const EXTRACTION_SCRIPT = `
// Check for Cloudflare block first
const title = document.title;
if (title.includes('Just a moment') || title.includes('Attention Required')) {
  return { blocked: true, title: title };
}

// Extract treatment pricing data
const treatments = [];
const priceElements = document.querySelectorAll('[data-testid*="price"], .price, [class*="price"]');

// Try multiple strategies to find treatments
const headers = document.querySelectorAll('h2, h3, h4');
headers.forEach(header => {
  const text = header.textContent.trim();
  if (text && text.length < 100 && !text.toLowerCase().includes('cookie') && !text.toLowerCase().includes('privacy')) {
    treatments.push({ type: 'heading', text: text });
  }
});

// Look for price indicators
const pricePattern = /£[\d,]+/g;
const bodyText = document.body.innerText;
const priceMatches = bodyText.match(pricePattern);

return {
  blocked: false,
  title: title,
  url: window.location.href,
  treatmentHeadings: treatments.length,
  pricesFound: priceMatches ? priceMatches.length : 0,
  sampleTreatments: treatments.slice(0, 10),
  samplePrices: priceMatches ? priceMatches.slice(0, 10) : []
};
`;

if (!APIFY_API_TOKEN) {
  console.error('❌ Error: APIFY_API_TOKEN not found');
  process.exit(1);
}

async function testCloudflareScraper() {
  console.log('='.repeat(60));
  console.log('Cloudflare Web Scraper Test');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Hospital: ${TEST_HOSPITAL.name}`);
  console.log(`URL: ${TEST_HOSPITAL.url}`);
  console.log('');
  console.log('Actor Configuration:');
  console.log('  - Residential proxies (UK)');
  console.log('  - Max retries: 2');
  console.log('  - Custom JavaScript extraction');
  console.log('  - HTML retrieval enabled');
  console.log('');

  try {
    console.log('🚀 Starting Cloudflare Web Scraper...');
    console.log('');

    const inputConfig = {
      max_retries_per_url: 2,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        apifyProxyCountry: "GB" // UK proxies for UK hospital
      },
      urls: [TEST_HOSPITAL.url],
      js_script: EXTRACTION_SCRIPT,
      js_timeout: 15,
      retrieve_result_from_js_script: true,
      page_is_loaded_before_running_script: true,
      execute_js_async: false,
      retrieve_html_from_url_after_loaded: true
    };

    const runResponse = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      },
      body: JSON.stringify(inputConfig)
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`API error: ${runResponse.status} - ${errorText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log(`✅ Run started: ${runId}`);
    console.log(`🔗 View in Apify: https://console.apify.com/actors/runs/${runId}`);
    console.log('');
    console.log('⏳ Waiting for completion (this may take 30-90 seconds)...');
    console.log('');

    // Poll for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30; // 2.5 minutes

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
      console.log('✅ Run SUCCEEDED!');
    } else if (status === 'FAILED') {
      console.log('❌ Run FAILED');
    } else if (status === 'RUNNING') {
      console.log('⏰ Run TIMEOUT (still running after 2.5 minutes)');
      console.log('   Check Apify console for final results');
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

    if (results.length === 0) {
      console.log('⚠️  No results returned');
      return;
    }

    const result = results[0];

    console.log('='.repeat(60));
    console.log('EXTRACTION RESULTS');
    console.log('='.repeat(60));
    console.log('');

    // Check if blocked
    if (result.result_from_js_script && result.result_from_js_script.blocked) {
      console.log('❌ BLOCKED BY CLOUDFLARE');
      console.log(`   Title: ${result.result_from_js_script.title}`);
      console.log('');
      console.log('   This means the actor was detected as a bot.');
      console.log('   May need to try different proxy settings or wait before retrying.');
    } else if (result.result_from_js_script) {
      console.log('✅ SUCCESSFULLY BYPASSED CLOUDFLARE');
      console.log('');
      console.log(`Page Title: ${result.result_from_js_script.title}`);
      console.log(`Treatment Headings Found: ${result.result_from_js_script.treatmentHeadings}`);
      console.log(`Price Elements Found: ${result.result_from_js_script.pricesFound}`);
      console.log('');

      if (result.result_from_js_script.sampleTreatments && result.result_from_js_script.sampleTreatments.length > 0) {
        console.log('Sample Treatments:');
        result.result_from_js_script.sampleTreatments.forEach((t, i) => {
          console.log(`  ${i + 1}. ${t.text}`);
        });
        console.log('');
      }

      if (result.result_from_js_script.samplePrices && result.result_from_js_script.samplePrices.length > 0) {
        console.log('Sample Prices:');
        result.result_from_js_script.samplePrices.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p}`);
        });
        console.log('');
      }

      console.log(`HTML Length: ${result.html ? result.html.length : 0} characters`);
      console.log('');

      if (result.result_from_js_script.treatmentHeadings > 0 || result.result_from_js_script.pricesFound > 0) {
        console.log('✅ VERDICT: This actor CAN extract data from Circle Health!');
      } else {
        console.log('⚠️  VERDICT: Bypassed Cloudflare but no pricing data found.');
        console.log('   May need to adjust extraction JavaScript.');
      }
    } else {
      console.log('⚠️  Unexpected result format');
    }

    console.log('');

    // Save full results
    const outputPath = 'Research/cloudflare-scraper-test-result.json';
    fs.writeFileSync(outputPath, JSON.stringify({
      actor: ACTOR_ID,
      hospital: TEST_HOSPITAL,
      runId: runId,
      status: status,
      timestamp: new Date().toISOString(),
      result: result
    }, null, 2));

    console.log('='.repeat(60));
    console.log(`💾 Full results saved to: ${outputPath}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testCloudflareScraper();
