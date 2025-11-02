require('dotenv').config();
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const runId = '8sXuFcfC18BVIdz4O';
const actorId = 'ChNuXurElMWvpbJB9';

async function checkResults() {
  const response = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
    { headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }}
  );

  const results = await response.json();

  console.log('Results count:', results.length);
  console.log('');
  console.log('Full results:');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('Research/apify-raw-result.json', JSON.stringify(results, null, 2));
  console.log('');
  console.log('✅ Saved to Research/apify-raw-result.json');
}

checkResults();
