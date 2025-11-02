/**
 * Test Apify Integration for Circle Health Hospitals
 *
 * This script tests different Apify actors to find the best method for bypassing
 * Cloudflare Bot Manager on Circle Health Group pricing pages.
 *
 * Requires: APIFY_API_TOKEN in environment or .env file
 */

require('dotenv').config();
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const TEST_HOSPITALS = [
  {
    name: 'The Beardwood Hospital',
    url: 'https://www.circlehealthgroup.co.uk/hospitals/the-beardwood-hospital/treatments-prices'
  },
  {
    name: 'Bath Clinic',
    url: 'https://www.circlehealthgroup.co.uk/hospitals/bath-clinic/treatments-prices'
  }
];

if (!APIFY_API_TOKEN) {
  console.error('❌ Error: APIFY_API_TOKEN not found in environment');
  console.error('');
  console.error('Please set APIFY_API_TOKEN in your .env file:');
  console.error('  APIFY_API_TOKEN=your_token_here');
  console.error('');
  console.error('Get your token from: https://console.apify.com/account/integrations');
  process.exit(1);
}

async function testWebScraper(hospitalUrl, hospitalName) {
  console.log(`\n📝 Testing Web Scraper on ${hospitalName}...`);

  try {
    // Start Web Scraper actor
    const runResponse = await fetch('https://api.apify.com/v2/acts/apify~web-scraper/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      },
      body: JSON.stringify({
        startUrls: [{ url: hospitalUrl }],
        pageFunction: `async function pageFunction(context) {
          const { request, log, jQuery } = context;

          // Check for Cloudflare block
          const title = jQuery('title').text();
          if (title.includes('Just a moment') || title.includes('Attention Required')) {
            return {
              url: request.url,
              blocked: true,
              title: title
            };
          }

          // Try to extract pricing data
          const treatments = [];
          jQuery('h2, h3, h4').each((i, el) => {
            const text = jQuery(el).text().trim();
            if (text && text.length < 100) {
              treatments.push(text);
            }
          });

          return {
            url: request.url,
            blocked: false,
            title: title,
            treatmentCount: treatments.length,
            sampleTreatments: treatments.slice(0, 5)
          };
        }`,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL']
        }
      })
    });

    if (!runResponse.ok) {
      throw new Error(`API error: ${runResponse.status} ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log(`  Run ID: ${runId}`);
    console.log(`  Waiting for completion...`);

    // Poll for completion (max 2 minutes)
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~web-scraper/runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
      });

      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;

      if (attempts % 3 === 0) {
        console.log(`  Still running... (${attempts * 5}s elapsed)`);
      }
    }

    if (status !== 'SUCCEEDED') {
      console.log(`  ⚠️  Run status: ${status}`);
      return { success: false, status };
    }

    // Get results
    const resultsResponse = await fetch(`https://api.apify.com/v2/acts/apify~web-scraper/runs/${runId}/dataset/items`, {
      headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
    });

    const results = await resultsResponse.json();

    if (results.length === 0) {
      console.log(`  ❌ No results returned`);
      return { success: false, error: 'No results' };
    }

    const result = results[0];

    if (result.blocked) {
      console.log(`  ❌ BLOCKED by Cloudflare`);
      console.log(`  Title: ${result.title}`);
      return { success: false, blocked: true };
    }

    console.log(`  ✅ SUCCESS`);
    console.log(`  Title: ${result.title}`);
    console.log(`  Treatments found: ${result.treatmentCount}`);
    console.log(`  Samples: ${result.sampleTreatments.join(', ')}`);

    return {
      success: true,
      blocked: false,
      treatmentCount: result.treatmentCount,
      result
    };

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPuppeteerScraper(hospitalUrl, hospitalName) {
  console.log(`\n🤖 Testing Puppeteer Scraper on ${hospitalName}...`);

  try {
    // Start Puppeteer Scraper actor
    const runResponse = await fetch('https://api.apify.com/v2/acts/apify~puppeteer-scraper/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      },
      body: JSON.stringify({
        startUrls: [{ url: hospitalUrl }],
        pageFunction: `async function pageFunction(context) {
          const { request, page } = context;

          // Wait for page to load
          await page.waitForTimeout(3000);

          // Check for Cloudflare block
          const title = await page.title();
          if (title.includes('Just a moment') || title.includes('Attention Required')) {
            return {
              url: request.url,
              blocked: true,
              title: title
            };
          }

          // Try to extract pricing data
          const treatments = await page.$$eval('h2, h3, h4', elements =>
            elements.map(el => el.textContent.trim())
                    .filter(text => text && text.length < 100)
          );

          return {
            url: request.url,
            blocked: false,
            title: title,
            treatmentCount: treatments.length,
            sampleTreatments: treatments.slice(0, 5)
          };
        }`,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL']
        }
      })
    });

    if (!runResponse.ok) {
      throw new Error(`API error: ${runResponse.status} ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log(`  Run ID: ${runId}`);
    console.log(`  Waiting for completion...`);

    // Poll for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 24;

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~puppeteer-scraper/runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
      });

      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;

      if (attempts % 3 === 0) {
        console.log(`  Still running... (${attempts * 5}s elapsed)`);
      }
    }

    if (status !== 'SUCCEEDED') {
      console.log(`  ⚠️  Run status: ${status}`);
      return { success: false, status };
    }

    // Get results
    const resultsResponse = await fetch(`https://api.apify.com/v2/acts/apify~puppeteer-scraper/runs/${runId}/dataset/items`, {
      headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
    });

    const results = await resultsResponse.json();

    if (results.length === 0) {
      console.log(`  ❌ No results returned`);
      return { success: false, error: 'No results' };
    }

    const result = results[0];

    if (result.blocked) {
      console.log(`  ❌ BLOCKED by Cloudflare`);
      console.log(`  Title: ${result.title}`);
      return { success: false, blocked: true };
    }

    console.log(`  ✅ SUCCESS`);
    console.log(`  Title: ${result.title}`);
    console.log(`  Treatments found: ${result.treatmentCount}`);
    console.log(`  Samples: ${result.sampleTreatments.join(', ')}`);

    return {
      success: true,
      blocked: false,
      treatmentCount: result.treatmentCount,
      result
    };

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Apify Integration Test for Circle Health');
  console.log('='.repeat(60));
  console.log('');
  console.log('Testing 2 hospitals with 2 different Apify actors:');
  console.log('1. Web Scraper (faster, cheaper)');
  console.log('2. Puppeteer Scraper (more powerful, better Cloudflare bypass)');
  console.log('');

  const results = {
    hospitals: [],
    summary: {}
  };

  for (const hospital of TEST_HOSPITALS) {
    console.log('\n' + '='.repeat(60));
    console.log(`Hospital: ${hospital.name}`);
    console.log(`URL: ${hospital.url}`);
    console.log('='.repeat(60));

    const webScraperResult = await testWebScraper(hospital.url, hospital.name);
    const puppeteerResult = await testPuppeteerScraper(hospital.url, hospital.name);

    results.hospitals.push({
      name: hospital.name,
      url: hospital.url,
      webScraper: webScraperResult,
      puppeteer: puppeteerResult
    });

    // Delay between hospitals to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const webScraperSuccess = results.hospitals.filter(h => h.webScraper.success).length;
  const puppeteerSuccess = results.hospitals.filter(h => h.puppeteer.success).length;

  console.log(`\nWeb Scraper: ${webScraperSuccess}/${TEST_HOSPITALS.length} successful`);
  console.log(`Puppeteer Scraper: ${puppeteerSuccess}/${TEST_HOSPITALS.length} successful`);

  results.summary = {
    totalHospitals: TEST_HOSPITALS.length,
    webScraperSuccessRate: webScraperSuccess / TEST_HOSPITALS.length,
    puppeteerSuccessRate: puppeteerSuccess / TEST_HOSPITALS.length
  };

  if (puppeteerSuccess > 0) {
    console.log('\n✅ RECOMMENDATION: Use Puppeteer Scraper for Circle Health');
    results.summary.recommendation = 'puppeteer-scraper';
  } else if (webScraperSuccess > 0) {
    console.log('\n✅ RECOMMENDATION: Use Web Scraper for Circle Health');
    results.summary.recommendation = 'web-scraper';
  } else {
    console.log('\n❌ Neither method successfully bypassed Cloudflare');
    console.log('   Consider: Manual extraction or API partnership');
    results.summary.recommendation = 'manual';
  }

  // Save results
  const outputPath = 'Research/apify-test-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Detailed results saved to: ${outputPath}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
