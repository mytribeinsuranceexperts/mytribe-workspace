require('dotenv').config();
const { ApifyClient } = require('apify-client');
const fs = require('fs');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const runId = 'JDhVE3bnoL2wcnI91';

async function checkResults() {
  try {
    const client = new ApifyClient({ token: APIFY_API_TOKEN });

    console.log('Fetching run details...\n');
    const run = await client.run(runId).get();

    console.log('Run Status:', run.status);
    console.log('Duration:', Math.round(run.stats.runTimeSecs), 'seconds');
    console.log('Dataset ID:', run.defaultDatasetId);
    console.log('\nFetching dataset items...\n');

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log('Items count:', items.length);
    console.log('\nFull results:');
    console.log(JSON.stringify(items, null, 2));

    fs.writeFileSync('Research/cookie-test-debug.json', JSON.stringify({
      run: run,
      items: items
    }, null, 2));

    console.log('\n✅ Saved to Research/cookie-test-debug.json');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkResults();
