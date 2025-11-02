const https = require('https');

const API_KEY = '9d004728-de34-4810-a778-b388015451f7';
const BASE_URL = 'https://api.service.cqc.org.uk/public/v1';

async function fetchLocations(perPage = 1000, page = 1) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.service.cqc.org.uk',
            path: `/public/v1/locations?perPage=${perPage}&page=${page}`,
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

async function analyzeData() {
    console.log('Fetching CQC data sample (1000 locations)...\n');

    const data = await fetchLocations(1000, 1);

    if (!data || !data.locations) {
        console.error('Error: No data received from API');
        console.error('Response:', JSON.stringify(data, null, 2));
        return;
    }

    const stats = {
        types: {},
        directorates: {},
        careHomes: { Y: 0, N: 0 },
        registrationStatus: {},
        serviceTypes: {},
        totalActive: 0,
        totalActiveNotCareHomes: 0
    };

    data.locations.forEach(loc => {
        // Type (NHS vs Private)
        stats.types[loc.type] = (stats.types[loc.type] || 0) + 1;

        // Inspection Directorate
        if (loc.inspectionDirectorate) {
            stats.directorates[loc.inspectionDirectorate] = (stats.directorates[loc.inspectionDirectorate] || 0) + 1;
        }

        // Care homes
        const careHome = loc.careHome || 'N';
        stats.careHomes[careHome]++;

        // Registration status
        stats.registrationStatus[loc.registrationStatus] = (stats.registrationStatus[loc.registrationStatus] || 0) + 1;

        // Service types
        if (loc.gacServiceTypes && loc.gacServiceTypes.length > 0) {
            loc.gacServiceTypes.forEach(service => {
                const name = service.name || service;
                stats.serviceTypes[name] = (stats.serviceTypes[name] || 0) + 1;
            });
        }

        // Active count
        if (loc.registrationStatus === 'Registered' && !loc.deregistrationDate) {
            stats.totalActive++;

            // Active + not care home
            if (careHome === 'N') {
                stats.totalActiveNotCareHomes++;
            }
        }
    });

    console.log('=== CQC Data Analysis ===');
    console.log('\nTotal locations in sample:', data.locations.length);
    console.log('Total locations in database:', data.totalResults);

    console.log('\n--- ORGANIZATION TYPES ---');
    Object.entries(stats.types).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
        const pct = (v / data.locations.length * 100).toFixed(1);
        console.log(`  ${k}: ${v} (${pct}%)`);
    });

    console.log('\n--- INSPECTION DIRECTORATES ---');
    Object.entries(stats.directorates).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
        const pct = (v / data.locations.length * 100).toFixed(1);
        console.log(`  ${k}: ${v} (${pct}%)`);
    });

    console.log('\n--- CARE HOMES ---');
    Object.entries(stats.careHomes).forEach(([k,v]) => {
        const pct = (v / data.locations.length * 100).toFixed(1);
        console.log(`  ${k === 'Y' ? 'Yes' : 'No'}: ${v} (${pct}%)`);
    });

    console.log('\n--- REGISTRATION STATUS ---');
    Object.entries(stats.registrationStatus).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
        const pct = (v / data.locations.length * 100).toFixed(1);
        console.log(`  ${k}: ${v} (${pct}%)`);
    });

    console.log('\n--- TOP SERVICE TYPES ---');
    Object.entries(stats.serviceTypes).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([k,v]) => {
        const pct = (v / data.locations.length * 100).toFixed(1);
        console.log(`  ${k}: ${v} (${pct}%)`);
    });

    console.log('\n=== FILTERING IMPACT ===');
    console.log(`\nOriginal: ${data.totalResults.toLocaleString()} locations`);

    const activeRatio = stats.totalActive / data.locations.length;
    const estimatedActive = Math.round(data.totalResults * activeRatio);
    console.log(`Filter 1 (Active only): ~${estimatedActive.toLocaleString()} locations (-${((1 - activeRatio) * 100).toFixed(1)}%)`);

    const activeNoCareRatio = stats.totalActiveNotCareHomes / data.locations.length;
    const estimatedActiveNoCare = Math.round(data.totalResults * activeNoCareRatio);
    console.log(`Filter 2 (Active + No Care Homes): ~${estimatedActiveNoCare.toLocaleString()} locations (-${((1 - activeNoCareRatio) * 100).toFixed(1)}%)`);

    console.log('\n=== STORAGE ESTIMATES ===');
    const avgRecordSize = 5; // KB
    const storageMB = (estimatedActiveNoCare * avgRecordSize / 1024).toFixed(1);
    console.log(`Estimated storage (Active + No Care Homes): ${storageMB} MB`);
    console.log(`Supabase free tier limit: 500 MB`);
    console.log(`Status: ${storageMB < 500 ? '✅ Within free tier' : '⚠️ Exceeds free tier'}`);

    console.log('\n=== API CALL ESTIMATES ===');
    const regionsCount = 9;
    const pagesPerRegion = Math.ceil(estimatedActiveNoCare / regionsCount / 100);
    const listCalls = regionsCount * pagesPerRegion;
    const detailCalls = Math.round(estimatedActiveNoCare * 0.7); // Two-pass filtering
    console.log(`List endpoints: ~${listCalls.toLocaleString()} calls`);
    console.log(`Detail endpoints (70% after filtering): ~${detailCalls.toLocaleString()} calls`);
    console.log(`Total per sync: ~${(listCalls + detailCalls).toLocaleString()} calls`);
    console.log(`Sync duration estimate: ~${Math.round((listCalls + detailCalls) * 0.05 / 60)} minutes`);
}

analyzeData().catch(console.error);
