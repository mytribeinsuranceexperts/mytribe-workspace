const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'uk_private_hospitals_filtered_2025-11-01.json'), 'utf8'));

console.log('🏥 Validation Sample - 20 Random Hospitals:\n');

const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 20);

shuffled.forEach((h, idx) => {
  const beds = h.hasBeds === 'Yes' ? h.numberOfBeds + ' beds' : 'No beds';
  const location = h.townCity + (h.county ? ', ' + h.county : '');

  console.log((idx + 1).toString().padStart(2) + '. ' + h.hospitalName);
  console.log('    ' + location + ' | ' + beds);
  console.log('    Service: ' + h.serviceTypes);
  if (h.rating && h.rating !== 'Not rated') {
    console.log('    Rating: ' + h.rating);
  }
  console.log('');
});
