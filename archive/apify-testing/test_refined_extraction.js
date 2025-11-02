/**
 * Refined Cloudflare Web Scraper Test
 * Focus: Better content filtering without async cookie handling
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

// Enhanced JavaScript with better filtering (no async cookie handling)
const EXTRACTION_SCRIPT = `
// Check for Cloudflare block
const title = document.title;
if (title.includes('Just a moment') || title.includes('Attention Required')) {
  return { blocked: true, title: title };
}

// Extract treatments and prices from MAIN content only
const treatments = [];
const prices = [];

// Target the main content area (avoid header/footer/nav)
const mainContent = document.querySelector('main, [role="main"], .main-content, #main-content') || document.body;

// Exclude patterns for non-treatment content
const excludePatterns = [
  'cookie', 'privacy', 'consent', 'navigation', 'menu', 'footer', 'header',
  'find a hospital', 'find a treatment', 'going private', 'search', 'login'
];

// Get all headings from main content
const headers = mainContent.querySelectorAll('h2, h3, h4');
headers.forEach(header => {
  const text = header.textContent.trim();
  const lowerText = text.toLowerCase();

  // Skip if matches exclude patterns
  if (excludePatterns.some(pattern => lowerText.includes(pattern))) {
    return;
  }

  // Skip if too short, too long, or looks like navigation
  if (text.length < 10 || text.length > 100) {
    return;
  }

  treatments.push(text);
});

// Extract prices from main content only
const pricePattern = /£[\\d,]+/g;
const contentText = mainContent.innerText || mainContent.textContent;

// Split into lines and filter out navigation/cookie content
const lines = contentText.split('\\n');
const relevantLines = lines.filter(line => {
  const lowerLine = line.toLowerCase();
  return !excludePatterns.some(pattern => lowerLine.includes(pattern));
});

const cleanText = relevantLines.join(' ');
const priceMatches = cleanText.match(pricePattern);

return {
  blocked: false,
  title: title,
  url: window.location.href,
  treatmentHeadings: treatments.length,
  pricesFound: priceMatches ? priceMatches.length : 0,
  sampleTreatments: treatments.slice(0, 20),
  samplePrices: priceMatches ? priceMatches.slice(0, 20) : [],
  extractionMethod: 'main-content-filtered'
};
`;

if (!APIFY_API_TOKEN) {
  console.error('❌ Error: APIFY_API_TOKEN not found');
  process.exit(1);
}

async function testRefinedExtraction() {
  console.log('='.repeat(60));
  console.log('Cloudflare Web Scraper - Refined Extraction Test');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Hospital: ${TEST_HOSPITAL.name}`);
  console.log(`URL: ${TEST_HOSPITAL.url}`);
  console.log('');
  console.log('Improvements:');
  console.log('  ✅ Target main content area only');
  console.log('  ✅ Filter navigation/cookie/privacy content');
  console.log('  ✅ Skip short/long headings');
  console.log('  ✅ Clean price extraction');
  console.log('');

  try {
    const client = new ApifyClient({ token: APIFY_API_TOKEN });

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
    console.log('REFINED EXTRACTION RESULTS');
    console.log('='.repeat(60));
    console.log('');

    if (result.result_from_js_script) {
      const jsResult = result.result_from_js_script;

      if (jsResult.blocked) {
        console.log('❌ BLOCKED BY CLOUDFLARE');
        console.log(`   Title: ${jsResult.title}`);
      } else {
        console.log('✅ SUCCESSFULLY BYPASSED CLOUDFLARE!');
        console.log('');
        console.log(`📄 Page Title: ${jsResult.title}`);
        console.log(`🏥 Treatment Headings (filtered): ${jsResult.treatmentHeadings}`);
        console.log(`💰 Price Elements (filtered): ${jsResult.pricesFound}`);
        console.log('');

        if (jsResult.sampleTreatments && jsResult.sampleTreatments.length > 0) {
          console.log('🔍 Sample Treatments (first 20, filtered):');
          jsResult.sampleTreatments.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t}`);
          });
          console.log('');
        }

        if (jsResult.samplePrices && jsResult.samplePrices.length > 0) {
          console.log('💷 Sample Prices (first 20):');
          jsResult.samplePrices.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p}`);
          });
          console.log('');
        }

        console.log(`📝 HTML Length: ${result.html ? result.html.length : 0} characters`);
        console.log('');

        // Analysis
        const navItemsRemoved = 158 - jsResult.treatmentHeadings;
        if (navItemsRemoved > 0) {
          console.log(`🧹 Filtered out ~${navItemsRemoved} navigation/cookie items`);
          console.log('');
        }

        if (jsResult.treatmentHeadings > 0 && jsResult.pricesFound > 0) {
          console.log('🎯 VERDICT: ✅ SUCCESS - Clean extraction working!');
          console.log('');
          console.log('Next steps:');
          console.log('1. Use this extraction method for production');
          console.log('2. Update circle_health group in hospital-locations.json');
          console.log('3. Create bulk extraction script for all 49 hospitals');
        }
      }
    }

    console.log('');

    const outputPath = 'Research/apify-refined-test-result.json';
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

testRefinedExtraction();
