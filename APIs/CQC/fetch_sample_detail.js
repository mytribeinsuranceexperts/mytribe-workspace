const https = require('https');
const fs = require('fs');

const API_KEY = 'f66d77340c8b4134a758513607afba55';

async function fetchData(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.service.cqc.org.uk',
            path: path,
            headers: {
                'Ocp-Apim-Subscription-Key': API_KEY,
                'Accept': 'application/json'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('Step 1: Fetching location list to get IDs...\n');

    const listData = await fetchData('/public/v1/locations?perPage=10&page=1');

    console.log('Response structure:');
    console.log(JSON.stringify(listData, null, 2));

    // Save to file
    fs.writeFileSync(
        'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-sample-list.json',
        JSON.stringify(listData, null, 2)
    );

    console.log('\n✅ Saved list response to: temp-sample-list.json\n');

    // If we got locations, fetch one detail
    if (listData.locations && listData.locations.length > 0) {
        const firstId = listData.locations[0].locationId;
        console.log(`\nStep 2: Fetching detail for location: ${firstId}...\n`);

        const detailData = await fetchData(`/public/v1/locations/${firstId}`);

        console.log('Detail structure:');
        console.log(JSON.stringify(detailData, null, 2));

        fs.writeFileSync(
            'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-sample-detail.json',
            JSON.stringify(detailData, null, 2)
        );

        console.log('\n✅ Saved detail response to: temp-sample-detail.json\n');
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
});
