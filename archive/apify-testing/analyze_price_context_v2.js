/**
 * Analyze price context from saved results
 * Look at HTML structure around prices to identify finance vs actual prices
 */

const fs = require('fs');

console.log('='.repeat(60));
console.log('PRICE CONTEXT ANALYSIS');
console.log('='.repeat(60));
console.log('');

const data = JSON.parse(fs.readFileSync('Research/apify-refined-test-result.json'));
const html = data.results[0].html;

console.log('HTML length:', html.length);
console.log('');

// Find all price patterns with surrounding context
const pricePattern = /(.{300})(£[\d,]+)(.{300})/g;
const matches = [...html.matchAll(pricePattern)];

console.log(`Total price occurrences: ${matches.length}`);
console.log('');
console.log('Analyzing first 30 price contexts...');
console.log('');

const contexts = [];
let financeCount = 0;
let depositCount = 0;
let consultationCount = 0;
let guideCount = 0;
let actualPriceCount = 0;

for (let i = 0; i < Math.min(30, matches.length); i++) {
  const match = matches[i];
  const before = match[1].slice(-150).replace(/\s+/g, ' ').replace(/[\r\n\t]+/g, ' ').trim();
  const price = match[2];
  const after = match[3].slice(0, 150).replace(/\s+/g, ' ').replace(/[\r\n\t]+/g, ' ').trim();

  console.log(`${i + 1}. ${price}`);
  console.log(`   Before: ...${before}`);
  console.log(`   After: ${after}...`);

  // Check for finance/payment keywords
  const combinedText = (before + after).toLowerCase();

  const isFinance = combinedText.includes('month') ||
                    combinedText.includes('per month') ||
                    combinedText.includes('finance') ||
                    combinedText.includes('interest') ||
                    combinedText.includes('apr') ||
                    combinedText.includes('from £') ||
                    combinedText.includes('loan');

  const isDeposit = combinedText.includes('deposit') ||
                    combinedText.includes('upfront');

  const isConsultation = combinedText.includes('consultation') ||
                         combinedText.includes('initial consultation') ||
                         combinedText.includes('appointment fee');

  const isGuidePrice = combinedText.includes('guide price') ||
                       combinedText.includes('starting from') ||
                       combinedText.includes('from £');

  const indicators = [];
  if (isFinance) { indicators.push('🏦 FINANCE'); financeCount++; }
  if (isDeposit) { indicators.push('💳 DEPOSIT'); depositCount++; }
  if (isConsultation) { indicators.push('👨‍⚕️ CONSULTATION'); consultationCount++; }
  if (isGuidePrice) { indicators.push('📊 GUIDE PRICE'); guideCount++; }

  if (indicators.length > 0) {
    console.log(`   ${indicators.join(', ')}`);
  } else {
    console.log('   ✅ LIKELY ACTUAL PRICE');
    actualPriceCount++;
  }

  contexts.push({
    index: i + 1,
    price: price,
    before: before,
    after: after,
    isFinance,
    isDeposit,
    isConsultation,
    isGuidePrice
  });

  console.log('');
}

console.log('='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log('');
console.log(`Total prices analyzed: ${contexts.length}`);
console.log(`Finance/loan prices: ${financeCount}`);
console.log(`Deposit prices: ${depositCount}`);
console.log(`Consultation prices: ${consultationCount}`);
console.log(`Guide prices: ${guideCount}`);
console.log(`Likely actual procedure prices: ${actualPriceCount}`);
console.log('');

// Look for specific patterns that indicate the actual price
console.log('='.repeat(60));
console.log('LOOKING FOR ACTUAL PRICE PATTERNS');
console.log('='.repeat(60));
console.log('');

// Search for patterns like "Total estimated cost: £X" or "Package price: £X"
const actualPricePatterns = [
  /total.*?cost.*?(£[\d,]+)/gi,
  /package.*?price.*?(£[\d,]+)/gi,
  /estimated.*?cost.*?(£[\d,]+)/gi,
  /procedure.*?cost.*?(£[\d,]+)/gi,
  /treatment.*?cost.*?(£[\d,]+)/gi,
  /self.*?pay.*?price.*?(£[\d,]+)/gi
];

actualPricePatterns.forEach((pattern, idx) => {
  const matches = [...html.matchAll(pattern)];
  if (matches.length > 0) {
    console.log(`Pattern ${idx + 1} (${pattern.source}): ${matches.length} matches`);
    matches.slice(0, 3).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m[0].slice(0, 100)}`);
    });
    console.log('');
  }
});

// Save detailed analysis
const output = {
  totalPrices: matches.length,
  analyzed: contexts.length,
  summary: {
    financeCount,
    depositCount,
    consultationCount,
    guideCount,
    actualPriceCount
  },
  contexts: contexts
};

fs.writeFileSync('Research/price-context-analysis.json', JSON.stringify(output, null, 2));
console.log('💾 Saved detailed analysis to Research/price-context-analysis.json');
