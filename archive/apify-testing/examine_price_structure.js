/**
 * Examine the actual HTML structure around prices
 * to understand what each price represents
 */

const fs = require('fs');
const cheerio = require('cheerio');

const data = JSON.parse(fs.readFileSync('Research/apify-refined-test-result.json'));
const html = data.results[0].html;

const $ = cheerio.load(html);

console.log('='.repeat(60));
console.log('EXAMINING PRICE STRUCTURE ON PAGE');
console.log('='.repeat(60));
console.log('');

// Look for the first treatment section
const firstTreatment = $('h3:contains("Abdominal hysterectomy")').first();

if (firstTreatment.length > 0) {
  console.log('Found first treatment heading:');
  console.log(firstTreatment.text().trim());
  console.log('');
  console.log('Parent structure:');
  console.log(firstTreatment.parent().prop('tagName'), firstTreatment.parent().attr('class'));
  console.log('');

  // Get the container
  const container = firstTreatment.closest('.treatment, .price-item, article, section').first();

  console.log('Treatment container:');
  console.log(container.prop('tagName'), container.attr('class') || container.attr('id'));
  console.log('');

  // Get all text within this container
  const containerText = container.text().replace(/\s+/g, ' ').trim();
  console.log('Full container text (first 500 chars):');
  console.log(containerText.slice(0, 500));
  console.log('');

  // Look for price patterns
  const priceMatches = containerText.match(/£[\d,]+/g);
  if (priceMatches) {
    console.log('Prices found in this treatment:');
    priceMatches.forEach(p => console.log('  ', p));
    console.log('');
  }
}

// Look at all headings that contain treatment names
console.log('='.repeat(60));
console.log('ALL TREATMENT HEADING STRUCTURES');
console.log('='.repeat(60));
console.log('');

$('h2, h3, h4').each((i, elem) => {
  if (i >= 5) return false; // First 5 only

  const $elem = $(elem);
  const text = $elem.text().trim();

  // Skip navigation
  if (text.toLowerCase().includes('find a') || text.toLowerCase().includes('going private')) {
    return;
  }

  console.log(`${i + 1}. ${elem.name.toUpperCase()}: ${text}`);
  console.log(`   Classes: ${$elem.attr('class') || 'none'}`);

  // Get next siblings until next heading
  let sibling = $elem.next();
  let siblingCount = 0;
  while (sibling.length > 0 && siblingCount < 3 && !['H2', 'H3', 'H4'].includes(sibling.prop('tagName'))) {
    const siblingText = sibling.text().replace(/\s+/g, ' ').trim();
    if (siblingText.length > 0 && siblingText.length < 200) {
      console.log(`   Next: ${sibling.prop('tagName')} - ${siblingText.slice(0, 100)}`);
    }
    sibling = sibling.next();
    siblingCount++;
  }
  console.log('');
});

console.log('='.repeat(60));
console.log('SEARCHING FOR PRICE LABELS');
console.log('='.repeat(60));
console.log('');

// Search for common price label patterns
const labels = [
  'guide price',
  'total cost',
  'package price',
  'consultation',
  'initial consultation',
  'deposit',
  'from £',
  'per month',
  'monthly payment'
];

labels.forEach(label => {
  const matches = $(`*:contains("${label}")`).filter((i, elem) => {
    const text = $(elem).text().toLowerCase();
    return text.includes(label) && text.length < 300;
  });

  if (matches.length > 0) {
    console.log(`Found "${label}": ${matches.length} occurrences`);
    matches.slice(0, 2).each((i, elem) => {
      const text = $(elem).text().replace(/\s+/g, ' ').trim().slice(0, 150);
      console.log(`  ${i + 1}. ${text}`);
    });
    console.log('');
  }
});

console.log('💾 Analysis complete');
