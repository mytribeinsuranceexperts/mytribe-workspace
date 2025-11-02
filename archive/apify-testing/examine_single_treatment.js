/**
 * Examine a single treatment in detail to understand price structure
 */

const fs = require('fs');
const cheerio = require('cheerio');

const data = JSON.parse(fs.readFileSync('Research/apify-refined-test-result.json'));
const html = data.results[0].html;

const $ = cheerio.load(html);

console.log('='.repeat(60));
console.log('DETAILED TREATMENT PRICE STRUCTURE');
console.log('='.repeat(60));
console.log('');

// Find treatment headings
const treatments = [];
$('h2, h3, h4').each((i, elem) => {
  const $elem = $(elem);
  const text = $elem.text().trim();

  // Skip non-treatment headings
  if (text.length < 10 || text.length > 100) return;
  if (text.toLowerCase().includes('find a') || text.toLowerCase().includes('going private')) return;
  if (text.toLowerCase().includes('cookie') || text.toLowerCase().includes('privacy')) return;

  treatments.push({ elem: $elem, text: text });
});

console.log(`Found ${treatments.length} treatment headings`);
console.log('');

// Examine first 3 treatments in detail
treatments.slice(0, 3).forEach((treatment, idx) => {
  console.log('='.repeat(60));
  console.log(`TREATMENT ${idx + 1}: ${treatment.text}`);
  console.log('='.repeat(60));
  console.log('');

  const $heading = treatment.elem;

  // Get parent container
  const $container = $heading.closest('div, article, section').first();

  // Get all text in this container up to next heading
  let content = '';
  let $next = $heading.next();
  let count = 0;

  while ($next.length > 0 && count < 10) {
    const tagName = $next.prop('tagName');

    // Stop at next heading
    if (['H2', 'H3', 'H4'].includes(tagName)) {
      break;
    }

    const text = $next.text().replace(/\s+/g, ' ').trim();
    if (text.length > 0) {
      content += text + ' ';
    }

    $next = $next.next();
    count++;
  }

  console.log('Content after heading:');
  console.log(content.slice(0, 800));
  console.log('');

  // Extract prices
  const prices = content.match(/£[\d,]+/g);
  if (prices) {
    console.log(`Prices found: ${prices.length}`);
    prices.forEach((p, i) => {
      // Find context around this price
      const priceIndex = content.indexOf(p);
      const before = content.slice(Math.max(0, priceIndex - 80), priceIndex).trim();
      const after = content.slice(priceIndex + p.length, priceIndex + p.length + 80).trim();

      console.log(`  ${i + 1}. ${p}`);
      console.log(`     Before: ...${before}`);
      console.log(`     After: ${after}...`);
    });
  } else {
    console.log('No prices found in immediate content');
  }

  console.log('');
});

// Look for price structure patterns
console.log('='.repeat(60));
console.log('PRICE STRUCTURE PATTERNS');
console.log('='.repeat(60));
console.log('');

// Search for elements that contain both "guide price" and a price
const guidePrices = $('*:contains("guide price")').filter((i, elem) => {
  const text = $(elem).text();
  return text.match(/guide price.*?£[\d,]+/i) || text.match(/£[\d,]+.*?guide price/i);
});

console.log(`Elements with "guide price" and £: ${guidePrices.length}`);
if (guidePrices.length > 0) {
  guidePrices.slice(0, 3).each((i, elem) => {
    const text = $(elem).text().replace(/\s+/g, ' ').trim().slice(0, 200);
    console.log(`${i + 1}. ${text}...`);
  });
}
console.log('');

// Search for elements with "from £"
const fromPrices = $('*:contains("from £")').filter((i, elem) => {
  const text = $(elem).text();
  return text.length < 200;
});

console.log(`Elements with "from £": ${fromPrices.length}`);
if (fromPrices.length > 0) {
  fromPrices.slice(0, 3).each((i, elem) => {
    const text = $(elem).text().replace(/\s+/g, ' ').trim();
    console.log(`${i + 1}. ${text}`);
  });
}

console.log('');
console.log('💾 Analysis complete');
