const fs = require('fs');
const path = require('path');

// Read the source data
const dataPath = path.join(__dirname, 'uk_private_hospitals_all_2025-11-01.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('📊 CQC Hospital Data Filtering');
console.log('================================\n');
console.log(`Total records in source: ${data.length}`);

// Apply filter: Hospital service type, excluding mental health
const filteredHospitals = data.filter(facility => {
  return facility.serviceTypes.includes('Hospital') &&
         !facility.serviceTypes.includes('Mental health');
});

console.log(`Records after filtering: ${filteredHospitals.length}`);
console.log(`Records excluded: ${data.length - filteredHospitals.length}\n`);

// Generate statistics
const stats = {
  total: filteredHospitals.length,
  withBeds: filteredHospitals.filter(h => h.hasBeds === 'Yes').length,
  withoutBeds: filteredHospitals.filter(h => h.hasBeds === 'No').length,
  filterCriteria: {
    included: 'serviceTypes includes "Hospital"',
    excluded: 'serviceTypes includes "Mental health"'
  },
  filterDate: new Date().toISOString(),
  sourceFile: 'uk_private_hospitals_all_2025-11-01.json',
  bedStatistics: {}
};

const withBeds = filteredHospitals.filter(h => h.hasBeds === 'Yes');
if (withBeds.length > 0) {
  const bedCounts = withBeds.map(h => parseInt(h.numberOfBeds)).sort((a, b) => a - b);
  stats.bedStatistics = {
    min: Math.min(...bedCounts),
    max: Math.max(...bedCounts),
    median: bedCounts[Math.floor(bedCounts.length / 2)],
    average: Math.round(bedCounts.reduce((a, b) => a + b, 0) / bedCounts.length)
  };
}

// Display statistics
console.log('📈 Statistics:');
console.log(`   Facilities with beds: ${stats.withBeds}`);
console.log(`   Facilities without beds: ${stats.withoutBeds}`);
if (Object.keys(stats.bedStatistics).length > 0) {
  console.log(`\n   Bed Statistics (for facilities with beds):`);
  console.log(`   - Minimum: ${stats.bedStatistics.min} beds`);
  console.log(`   - Maximum: ${stats.bedStatistics.max} beds`);
  console.log(`   - Median: ${stats.bedStatistics.median} beds`);
  console.log(`   - Average: ${stats.bedStatistics.average} beds`);
}

// Show sample results
console.log('\n📋 Sample Results (first 15):');
console.log('─'.repeat(80));
filteredHospitals.slice(0, 15).forEach((h, idx) => {
  const beds = h.hasBeds === 'Yes' ? `${h.numberOfBeds} beds` : 'No beds';
  console.log(`${(idx + 1).toString().padStart(2)}. ${h.hospitalName}`);
  console.log(`    ${beds} | ${h.townCity} | ${h.serviceTypes}`);
});

// Save filtered JSON
const outputJsonPath = path.join(__dirname, 'uk_private_hospitals_filtered_2025-11-01.json');
fs.writeFileSync(outputJsonPath, JSON.stringify(filteredHospitals, null, 2), 'utf8');
console.log('\n✅ Saved filtered JSON:', path.basename(outputJsonPath));

// Save filtered CSV
const outputCsvPath = path.join(__dirname, 'uk_private_hospitals_filtered_2025-11-01.csv');
const csvHeaders = [
  'CQC Location ID', 'CQC Provider ID', 'Hospital Name', 'Provider Name',
  'Address Line 1', 'Address Line 2', 'Town/City', 'County', 'Postal Code',
  'Region', 'Local Authority', 'Constituency', 'Latitude', 'Longitude',
  'Phone', 'Website', 'Number of Beds', 'Has Beds', 'Registration Date',
  'Rating', 'Rating Date', 'Service Types', 'Specialisms',
  'Companies House Number', 'Last Updated'
];

const csvRows = filteredHospitals.map(h => [
  h.cqcLocationId,
  h.cqcProviderId,
  h.hospitalName,
  h.providerName,
  h.addressLine1,
  h.addressLine2,
  h.townCity,
  h.county,
  h.postalCode,
  h.region,
  h.localAuthority,
  h.constituency,
  h.latitude,
  h.longitude,
  h.phone,
  h.website,
  h.numberOfBeds,
  h.hasBeds,
  h.registrationDate,
  h.rating,
  h.ratingDate,
  h.serviceTypes,
  h.specialisms,
  h.companiesHouseNumber,
  h.lastUpdated
].map(field => {
  // Escape fields containing commas or quotes
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}).join(','));

const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
fs.writeFileSync(outputCsvPath, csvContent, 'utf8');
console.log('✅ Saved filtered CSV:', path.basename(outputCsvPath));

// Save statistics report
const statsPath = path.join(__dirname, 'filter_statistics_2025-11-01.json');
fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
console.log('✅ Saved statistics report:', path.basename(statsPath));

console.log('\n✨ Filtering complete!');
