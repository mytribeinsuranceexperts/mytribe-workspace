/**
 * Production Spire Healthcare Extraction
 * Uses Playwright with real browser to handle dynamic AJAX price loading
 *
 * Why Playwright for Spire:
 * - Prices loaded via AJAX after accordion click (not in initial HTML)
 * - Requires real browser JavaScript execution
 * - Apify actor cannot trigger site's AJAX calls
 *
 * Performance: ~3-4 minutes per hospital (40 accordions)
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function extractSpireHospital(hospital) {
  const { name, url } = hospital;

  console.log('='.repeat(70));
  console.log(`Extracting: ${name}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(70));

  let browser;
  const results = {
    hospital_name: name,
    hospital_url: url,
    extraction_timestamp: new Date().toISOString(),
    treatments: [],
    errors: []
  };

  try {
    // Launch browser with anti-detection
    browser = await chromium.launch({
      headless: true, // Run headless for production
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-GB',
      timezoneId: 'Europe/London'
    });

    const page = await context.newPage();

    // Navigate to pricing page
    console.log('Loading page...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check for Cloudflare block
    const title = await page.title();
    if (title.includes('Just a moment') || title.includes('Attention Required')) {
      throw new Error('Blocked by Cloudflare');
    }

    // Handle cookie consent
    try {
      const acceptButton = page.locator('#onetrust-accept-btn-handler, button:has-text("Accept")').first();
      if (await acceptButton.isVisible({ timeout: 5000 })) {
        await acceptButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // No cookie banner or already accepted
    }

    // Find all accordion buttons
    const accordionButtons = await page.locator('a.js-getprices').all();
    console.log(`Found ${accordionButtons.length} treatments`);

    // Extract from each accordion
    for (let i = 0; i < accordionButtons.length; i++) {
      const button = accordionButtons[i];

      try {
        // Get treatment name
        const treatmentName = (await button.textContent()).trim() || `Treatment ${i + 1}`;

        // Scroll into view and click
        await button.scrollIntoViewIfNeeded();
        await button.click();

        // Wait for AJAX to load prices
        await page.waitForTimeout(2000);

        // Get accordion ID and extract prices
        const accordionId = await button.getAttribute('aria-controls');
        if (accordionId) {
          const accordion = page.locator(`#pricingaccordionheader${accordionId}`);
          const accordionText = await accordion.textContent();

          // Extract all prices
          const prices = accordionText.match(/£[\d,]+/g) || [];

          if (prices.length > 0) {
            // Parse price structure (similar to Circle Health)
            // Spire typically has: Consultation fee, Hospital fee, Total guide price
            const uniquePrices = [...new Set(prices)];

            results.treatments.push({
              treatment_name: treatmentName,
              prices: {
                all_prices: prices,
                unique_prices: uniquePrices,
                price_count: prices.length
              },
              accordion_id: accordionId
            });

            console.log(`  ${i + 1}/${accordionButtons.length}: ${treatmentName} - ${prices.length} prices`);
          } else {
            console.log(`  ${i + 1}/${accordionButtons.length}: ${treatmentName} - No prices found`);
          }
        }

      } catch (error) {
        results.errors.push({
          treatment_index: i,
          error: error.message
        });
        console.log(`  ${i + 1}/${accordionButtons.length}: Error - ${error.message}`);
      }
    }

    results.total_treatments = results.treatments.length;
    results.total_prices = results.treatments.reduce((sum, t) => sum + t.prices.price_count, 0);

  } catch (error) {
    results.fatal_error = error.message;
    console.error('Fatal error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

async function extractAllSpireHospitals() {
  console.log('='.repeat(70));
  console.log('SPIRE HEALTHCARE PRODUCTION EXTRACTION');
  console.log('='.repeat(70));
  console.log('');

  // Load hospital list
  const hospitalData = JSON.parse(fs.readFileSync('Research/hospital-locations.json'));
  const spireHospitals = hospitalData.spire_healthcare.locations || [];

  console.log(`Total Spire hospitals: ${spireHospitals.length}`);
  console.log('Estimated time: ${Math.round(spireHospitals.length * 3.5)} minutes');
  console.log('');

  const allResults = [];
  const startTime = Date.now();

  // Extract each hospital
  for (let i = 0; i < spireHospitals.length; i++) {
    const hospital = {
      name: spireHospitals[i].name,
      url: spireHospitals[i].pricing_url || spireHospitals[i].url
    };

    console.log(`\nProgress: ${i + 1}/${spireHospitals.length}`);

    const result = await extractSpireHospital(hospital);
    allResults.push(result);

    // Save incremental results
    fs.writeFileSync(
      `Research/production/spire-results-partial.json`,
      JSON.stringify(allResults, null, 2)
    );
  }

  const duration = Math.round((Date.now() - startTime) / 1000 / 60);

  // Save final results
  const finalResults = {
    extraction_date: new Date().toISOString(),
    total_hospitals: spireHospitals.length,
    duration_minutes: duration,
    hospitals: allResults,
    summary: {
      successful: allResults.filter(r => !r.fatal_error).length,
      failed: allResults.filter(r => r.fatal_error).length,
      total_treatments: allResults.reduce((sum, r) => sum + (r.total_treatments || 0), 0),
      total_prices: allResults.reduce((sum, r) => sum + (r.total_prices || 0), 0)
    }
  };

  fs.writeFileSync(
    'Research/production/spire-extraction-results.json',
    JSON.stringify(finalResults, null, 2)
  );

  // Convert to CSV format matching Apify output
  const csvRows = [];
  csvRows.push([
    'Hospital Name',
    'Treatment Name',
    'All Prices',
    'Unique Prices',
    'Price Count',
    'Extraction Date'
  ]);

  allResults.forEach(hospital => {
    if (hospital.treatments) {
      hospital.treatments.forEach(treatment => {
        csvRows.push([
          hospital.hospital_name,
          treatment.treatment_name,
          treatment.prices.all_prices.join('; '),
          treatment.prices.unique_prices.join('; '),
          treatment.prices.price_count,
          hospital.extraction_timestamp
        ]);
      });
    }
  });

  const csv = csvRows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  fs.writeFileSync('Research/production/spire-extraction-results.csv', csv);

  // Print summary
  console.log('');
  console.log('='.repeat(70));
  console.log('EXTRACTION COMPLETE');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Duration: ${duration} minutes`);
  console.log(`Hospitals processed: ${finalResults.total_hospitals}`);
  console.log(`Successful: ${finalResults.summary.successful}`);
  console.log(`Failed: ${finalResults.summary.failed}`);
  console.log(`Total treatments: ${finalResults.summary.total_treatments}`);
  console.log(`Total prices: ${finalResults.summary.total_prices}`);
  console.log('');
  console.log('Files saved:');
  console.log('  - Research/production/spire-extraction-results.json');
  console.log('  - Research/production/spire-extraction-results.csv');
  console.log('='.repeat(70));
}

// Run if called directly
if (require.main === module) {
  extractAllSpireHospitals().catch(console.error);
}

module.exports = { extractSpireHospital, extractAllSpireHospitals };
