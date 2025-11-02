const https = require('https');

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

async function analyzeCategories() {
    console.log('Fetching CQC provider types and categories...\n');

    // Fetch a sample of locations to analyze categories
    const data = await fetchData('/public/v1/locations?perPage=1000&page=1');

    if (!data || !data.locations) {
        console.error('Error: No data received from API');
        console.error('Response:', JSON.stringify(data, null, 2));
        return;
    }

    console.log(`✅ Successfully fetched ${data.locations.length} locations\n`);
    const totalResults = data.totalResults || data.locations.length;
    console.log(`📊 Total CQC locations: ${totalResults.toLocaleString()}\n`);

    const categories = {
        organizationTypes: {},
        inspectionDirectorates: {},
        serviceTypes: {},
        specialisms: {},
        careHome: { Y: 0, N: 0, unknown: 0 },
        registrationStatus: {}
    };

    data.locations.forEach(loc => {
        // Organization type (NHS vs Private)
        if (loc.type) {
            categories.organizationTypes[loc.type] = (categories.organizationTypes[loc.type] || 0) + 1;
        }

        // Inspection Directorate
        if (loc.inspectionDirectorate) {
            categories.inspectionDirectorates[loc.inspectionDirectorate] =
                (categories.inspectionDirectorates[loc.inspectionDirectorate] || 0) + 1;
        }

        // Care home flag
        const careHome = loc.careHome || 'unknown';
        categories.careHome[careHome]++;

        // Registration status
        if (loc.registrationStatus) {
            categories.registrationStatus[loc.registrationStatus] =
                (categories.registrationStatus[loc.registrationStatus] || 0) + 1;
        }

        // Service types (gacServiceTypes)
        if (loc.gacServiceTypes && Array.isArray(loc.gacServiceTypes)) {
            loc.gacServiceTypes.forEach(service => {
                const name = service.name || service;
                categories.serviceTypes[name] = (categories.serviceTypes[name] || 0) + 1;
            });
        }

        // Specialisms
        if (loc.specialisms && Array.isArray(loc.specialisms)) {
            loc.specialisms.forEach(spec => {
                const name = spec.name || spec;
                categories.specialisms[name] = (categories.specialisms[name] || 0) + 1;
            });
        }
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 ORGANIZATION TYPES (NHS vs Private)');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.organizationTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            const pct = (count / data.locations.length * 100).toFixed(1);
            console.log(`  ${type.padEnd(40)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏥 INSPECTION DIRECTORATES');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.inspectionDirectorates)
        .sort((a, b) => b[1] - a[1])
        .forEach(([dir, count]) => {
            const pct = (count / data.locations.length * 100).toFixed(1);
            console.log(`  ${dir.padEnd(40)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏠 CARE HOME STATUS');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.careHome).forEach(([status, count]) => {
        const label = status === 'Y' ? 'Yes (Care Home)' :
                      status === 'N' ? 'No (Not Care Home)' :
                      'Unknown';
        const pct = (count / data.locations.length * 100).toFixed(1);
        console.log(`  ${label.padEnd(40)} ${count.toString().padStart(6)} (${pct}%)`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📝 REGISTRATION STATUS');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.registrationStatus)
        .sort((a, b) => b[1] - a[1])
        .forEach(([status, count]) => {
            const pct = (count / data.locations.length * 100).toFixed(1);
            console.log(`  ${status.padEnd(40)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔧 SERVICE TYPES (Top 30)');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.serviceTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .forEach(([service, count]) => {
            const pct = (count / data.locations.length * 100).toFixed(1);
            console.log(`  ${service.padEnd(50)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    if (Object.keys(categories.specialisms).length > 0) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('⚕️  SPECIALISMS (Top 30)');
        console.log('═══════════════════════════════════════════════════════════');
        Object.entries(categories.specialisms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .forEach(([spec, count]) => {
                const pct = (count / data.locations.length * 100).toFixed(1);
                console.log(`  ${spec.padEnd(50)} ${count.toString().padStart(6)} (${pct}%)`);
            });
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 FILTERING RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════');

    const activeCount = categories.registrationStatus['Registered'] || 0;
    const careHomeCount = categories.careHome['Y'] || 0;
    const notCareHomeCount = categories.careHome['N'] || 0;

    console.log(`\n✅ INCLUDE (Active + No Care Homes):`);
    console.log(`   - registrationStatus === 'Registered'`);
    console.log(`   - careHome === 'N'`);
    console.log(`   - Estimated: ~${Math.round(totalResults * (notCareHomeCount / data.locations.length) * (activeCount / data.locations.length)).toLocaleString()} locations`);

    console.log(`\n❌ EXCLUDE:`);
    console.log(`   - Care homes (careHome === 'Y'): ~${Math.round(totalResults * (careHomeCount / data.locations.length)).toLocaleString()} locations`);
    console.log(`   - Deregistered facilities: ~${Math.round(totalResults * ((categories.registrationStatus['Deregistered'] || 0) / data.locations.length)).toLocaleString()} locations`);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('💾 SAVING FULL ANALYSIS TO FILE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const fs = require('fs');
    const output = {
        metadata: {
            fetchedAt: new Date().toISOString(),
            sampleSize: data.locations.length,
            totalLocations: totalResults
        },
        categories
    };

    fs.writeFileSync(
        'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-categories.json',
        JSON.stringify(output, null, 2)
    );

    console.log('✅ Full analysis saved to: temp-categories.json\n');
}

analyzeCategories().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
});
