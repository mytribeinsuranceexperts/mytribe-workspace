/**
 * Analyze price context from refined extraction
 * Look at HTML structure around prices to identify finance vs actual prices
 */

require('dotenv').config();
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const runId = 'FdEVw5jwjzZm3cowX'; // Latest refined extraction run

async function analyzePriceContext() {
  try {
    const client = new ApifyClient({ token: APIFY_API_TOKEN });
    const { items } = await client.dataset('k3ftF9NxYuYRuACB8').listItems();

    if (items.length === 0) {
      console.log('No results found');
      return;
    }

    const result = items[0];
    const html = result.html;

    console.log('='.repeat(60));
    console.log('PRICE CONTEXT ANALYSIS');
    console.log('='.repeat(60));
    console.log('');

    // Find all price patterns with surrounding context
    const pricePattern = /(.{200})(£[\d,]+)(.{200})/g;
    const matches = [...html.matchAll(pricePattern)];

    console.log(`Total price occurrences: ${matches.length}`);
    console.log('');
    console.log('Analyzing first 20 price contexts...');
    console.log('');

    const contexts = [];

    for (let i = 0; i < Math.min(20, matches.length); i++) {
      const match = matches[i];
      const before = match[1].slice(-100).replace(/\s+/g, ' ').trim();
      const price = match[2];
      const after = match[3].slice(0, 100).replace(/\s+/g, ' ').trim();

      const context = {
        index: i + 1,
        price: price,
        before: before,
        after: after,
        fullContext: `${before} [${price}] ${after}`
      };

      contexts.push(context);

      console.log(`${i + 1}. ${price}`);
      console.log(`   Before: ...${before}`);
      console.log(`   After: ${after}...`);

      // Check for finance keywords
      const combinedText = (before + after).toLowerCase();
      const isFinance = combinedText.includes('month') ||
                        combinedText.includes('per month') ||
                        combinedText.includes('finance') ||
                        combinedText.includes('interest') ||
                        combinedText.includes('apr') ||
                        combinedText.includes('loan');

      const isDeposit = combinedText.includes('deposit') ||
                        combinedText.includes('upfront');

      const isConsultation = combinedText.includes('consultation') ||
                             combinedText.includes('initial') ||
                             combinedText.includes('appointment');

      if (isFinance) console.log('   🏦 FINANCE INDICATOR');
      if (isDeposit) console.log('   💳 DEPOSIT INDICATOR');
      if (isConsultation) console.log('   👨‍⚕️ CONSULTATION INDICATOR');

      console.log('');
    }

    // Look for specific HTML structure patterns
    console.log('='.repeat(60));
    console.log('LOOKING FOR PRICE STRUCTURE PATTERNS');
    console.log('='.repeat(60));
    console.log('');

    // Check for data attributes or classes that might identify price types
    const priceWithClass = /<[^>]*class="[^"]*price[^"]*"[^>]*>(.*?)£[\d,]+/gi;
    const classMatches = [...html.matchAll(priceWithClass)];

    if (classMatches.length > 0) {
      console.log('Found price elements with classes:');
      classMatches.slice(0, 10).forEach((m, i) => {
        console.log(`${i + 1}. ${m[0].slice(0, 150)}...`);
      });
      console.log('');
    }

    // Save detailed analysis
    const output = {
      runId: runId,
      totalPrices: matches.length,
      contexts: contexts,
      patterns: {
        financeCount: contexts.filter(c =>
          (c.before + c.after).toLowerCase().includes('month') ||
          (c.before + c.after).toLowerCase().includes('finance')
        ).length,
        depositCount: contexts.filter(c =>
          (c.before + c.after).toLowerCase().includes('deposit')
        ).length,
        consultationCount: contexts.filter(c =>
          (c.before + c.after).toLowerCase().includes('consultation')
        ).length
      }
    };

    fs.writeFileSync('Research/price-context-analysis.json', JSON.stringify(output, null, 2));
    console.log('💾 Saved detailed analysis to Research/price-context-analysis.json');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzePriceContext();
