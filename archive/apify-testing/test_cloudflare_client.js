/**
 * Test Cloudflare Web Scraper Actor using Apify Client
 * Actor ID: ChNuXurElMWvpbJB9
 */

require('dotenv').config();
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'ChNuXurElMWvpbJB9';

const TEST_HOSPITAL = {
  name: 'The Beardwood Hospital',
  url: 'https://www.circlehealthgroup.co.uk/hospitals/the-beardwood-hospital/treatments-prices'
};

// JavaScript to extract pricing data
const EXTRACTION_SCRIPT = `
// Check for Cloudflare block
const title = document.title;
if (title.includes('Just a moment') || title.includes('Attention Required')) {
  return { blocked: true, title: title };
}

// Extract treatment pricing data
const treatments = [];
const headers = document.querySelectorAll('h2, h3, h4');
headers.forEach(header => {
  const text = header.textContent.trim();
  if (text && text.length < 100 && !text.toLowerCase().includes('cookie') && !text.toLowerCase().includes('privacy')) {
    treatments.push(text);
  }
});

// Look for prices
const pricePattern = /£[\\d,]+/g;
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
  console.log('Cloudflare Web Scraper Test (Official Client)');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Hospital: ${TEST_HOSPITAL.name}`);
  console.log(`URL: ${TEST_HOSPITAL.url}`);
  console.log('');

  try {
    // Initialize client
    const client = new ApifyClient({ token: APIFY_API_TOKEN });

    // Prepare input
    const input = {
      urls: [TEST_HOSPITAL.url],
      js_script: EXTRACTION_SCRIPT,
      js_timeout: 15,
      retrieve_result_from_js_script: true,
      page_is_loaded_before_running_script: true,
      execute_js_async: false,
      retrieve_html_from_url_after_loaded: true,
      max_retries_per_url: 2,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        apifyProxyCountry: "GB"
      }
    };

    console.log('🚀 Starting actor run...');
    console.log('');

    // Run the actor and wait for it to finish
    const run = await client.actor(ACTOR_ID).call(input);

    console.log(`✅ Run completed: ${run.id}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Duration: ${Math.round(run.stats.runTimeSecs)}s`);
    console.log(`🔗 View in Apify: https://console.apify.com/actors/runs/${run.id}`);
    console.log('');

    // Fetch results from dataset
    console.log('📊 Fetching results from dataset...');
    console.log('');

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📦 Results count: ${items.length}`);
    console.log('');

    if (items.length === 0) {
      console.log('⚠️  No results returned');
      return;
    }

    const result = items[0];

    console.log('='.repeat(60));
    console.log('EXTRACTION RESULTS');
    console.log('='.repeat(60));
    console.log('');

    // Check if JavaScript extraction worked
    if (result.result_from_js_script) {
      const jsResult = result.result_from_js_script;

      if (jsResult.blocked) {
        console.log('❌ BLOCKED BY CLOUDFLARE');
        console.log(`   Title: ${jsResult.title}`);
        console.log('');
        console.log('   The actor was detected. Try different settings.');
      } else {
        console.log('✅ SUCCESSFULLY BYPASSED CLOUDFLARE!');
        console.log('');
        console.log(`📄 Page Title: ${jsResult.title}`);
        console.log(`🏥 Treatment Headings: ${jsResult.treatmentHeadings}`);
        console.log(`💰 Price Elements: ${jsResult.pricesFound}`);
        console.log('');

        if (jsResult.sampleTreatments && jsResult.sampleTreatments.length > 0) {
          console.log('🔍 Sample Treatments:');
          jsResult.sampleTreatments.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t}`);
          });
          console.log('');
        }

        if (jsResult.samplePrices && jsResult.samplePrices.length > 0) {
          console.log('💷 Sample Prices:');
          jsResult.samplePrices.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p}`);
          });
          console.log('');
        }

        console.log(`📝 HTML Length: ${result.html ? result.html.length : 0} characters`);
        console.log('');

        if (jsResult.treatmentHeadings > 0 || jsResult.pricesFound > 0) {
          console.log('🎯 VERDICT: ✅ SUCCESS - Can extract Circle Health data!');
          console.log('');
          console.log('Next steps:');
          console.log('1. Update hospital-locations.json:');
          console.log('   - Set circle_health.scraping_method = "apify-cloudflare"');
          console.log('   - Set circle_health.bot_protection = "cloudflare-bypassed"');
          console.log('2. Create full extraction script for all 49 hospitals');
        } else {
          console.log('⚠️  VERDICT: Bypassed Cloudflare but no data found');
          console.log('   Need to refine extraction JavaScript');
        }
      }
    } else {
      console.log('⚠️  No JavaScript result returned');
      console.log('   HTML length:', result.html ? result.html.length : 0);
    }

    console.log('');

    // Save full results
    const outputPath = 'Research/apify-test-success.json';
    fs.writeFileSync(outputPath, JSON.stringify({
      actor: ACTOR_ID,
      hospital: TEST_HOSPITAL,
      runId: run.id,
      status: run.status,
      duration: run.stats.runTimeSecs,
      timestamp: new Date().toISOString(),
      results: items
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
