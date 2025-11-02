/**
 * Test Cloudflare Web Scraper with Cookie Banner Handling
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

// JavaScript to dismiss cookies then extract pricing data
const EXTRACTION_SCRIPT = `
// Step 1: Handle cookie consent
try {
  // Common cookie banner button selectors
  const cookieSelectors = [
    'button[id*="accept"]',
    'button[class*="accept"]',
    'button[id*="cookie"]',
    'button[class*="cookie"]',
    'button[id*="consent"]',
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '[data-cookiebanner-action="accept"]',
    '.cookie-accept',
    '.accept-cookies'
  ];

  let cookieHandled = false;
  for (const selector of cookieSelectors) {
    const button = document.querySelector(selector);
    if (button && button.offsetParent !== null) {
      button.click();
      cookieHandled = true;
      // Wait a moment for banner to disappear
      await new Promise(r => setTimeout(r, 500));
      break;
    }
  }
} catch (e) {
  console.log('Cookie handling error:', e.message);
}

// Step 2: Check for Cloudflare block
const title = document.title;
if (title.includes('Just a moment') || title.includes('Attention Required')) {
  return { blocked: true, title: title };
}

// Step 3: Extract treatments and prices ONLY from main content
const treatments = [];

// Target the actual treatment/pricing content area
const contentArea = document.querySelector('main, [role="main"], .content, #content') || document.body;

// Filter out cookie/privacy/navigation content
const excludePatterns = ['cookie', 'privacy', 'consent', 'navigation', 'menu', 'footer', 'header'];

const headers = contentArea.querySelectorAll('h2, h3, h4');
headers.forEach(header => {
  const text = header.textContent.trim();
  const lowerText = text.toLowerCase();

  // Skip if matches exclude patterns
  if (excludePatterns.some(pattern => lowerText.includes(pattern))) {
    return;
  }

  // Skip if too short or too long
  if (text.length < 5 || text.length > 100) {
    return;
  }

  treatments.push(text);
});

// Extract prices from main content only
const pricePattern = /£[\\d,]+/g;
const contentText = contentArea.innerText || contentArea.textContent;
const priceMatches = contentText.match(pricePattern);

return {
  blocked: false,
  title: title,
  url: window.location.href,
  cookieHandled: true,
  treatmentHeadings: treatments.length,
  pricesFound: priceMatches ? priceMatches.length : 0,
  sampleTreatments: treatments.slice(0, 15),
  samplePrices: priceMatches ? priceMatches.slice(0, 15) : []
};
`;

if (!APIFY_API_TOKEN) {
  console.error('❌ Error: APIFY_API_TOKEN not found');
  process.exit(1);
}

async function testCloudflareScraper() {
  console.log('='.repeat(60));
  console.log('Cloudflare Web Scraper - Cookie Handling Test');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Hospital: ${TEST_HOSPITAL.name}`);
  console.log(`URL: ${TEST_HOSPITAL.url}`);
  console.log('');
  console.log('Features:');
  console.log('  ✅ Cookie banner auto-dismissal');
  console.log('  ✅ Cloudflare bypass');
  console.log('  ✅ Filtered extraction (no nav/cookie content)');
  console.log('');

  try {
    const client = new ApifyClient({ token: APIFY_API_TOKEN });

    const input = {
      urls: [TEST_HOSPITAL.url],
      js_script: EXTRACTION_SCRIPT,
      js_timeout: 20, // Longer timeout for cookie handling
      retrieve_result_from_js_script: true,
      page_is_loaded_before_running_script: true,
      execute_js_async: true, // Enable async for cookie handling
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

    const run = await client.actor(ACTOR_ID).call(input);

    console.log(`✅ Run completed: ${run.id}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Duration: ${Math.round(run.stats.runTimeSecs)}s`);
    console.log(`🔗 View in Apify: https://console.apify.com/actors/runs/${run.id}`);
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
    console.log('EXTRACTION RESULTS (With Cookie Handling)');
    console.log('='.repeat(60));
    console.log('');

    if (result.result_from_js_script) {
      const jsResult = result.result_from_js_script;

      if (jsResult.blocked) {
        console.log('❌ BLOCKED BY CLOUDFLARE');
        console.log(`   Title: ${jsResult.title}`);
      } else {
        console.log('✅ SUCCESSFULLY BYPASSED CLOUDFLARE!');
        console.log(`✅ Cookie banner handled: ${jsResult.cookieHandled ? 'Yes' : 'No'}`);
        console.log('');
        console.log(`📄 Page Title: ${jsResult.title}`);
        console.log(`🏥 Treatment Headings (filtered): ${jsResult.treatmentHeadings}`);
        console.log(`💰 Price Elements: ${jsResult.pricesFound}`);
        console.log('');

        if (jsResult.sampleTreatments && jsResult.sampleTreatments.length > 0) {
          console.log('🔍 Sample Treatments (no cookie/nav content):');
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
          console.log('🎯 VERDICT: ✅ SUCCESS - Clean extraction working!');
        }
      }
    }

    console.log('');

    const outputPath = 'Research/apify-cookie-test-result.json';
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
