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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 CQC INSPECTION DIRECTORATE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Focusing on: Independent Healthcare Org & Primary Medical Services\n');

    const directorates = {
        byType: {},
        detailed: []
    };

    let totalSampled = 0;
    let processed = 0;

    // Sample more pages to get diverse data
    const pagesToFetch = 50; // Fetch 50 pages

    for (let page = 1; page <= pagesToFetch; page++) {
        try {
            const listData = await fetchData(`/public/v1/locations?perPage=100&page=${page * 10}`);

            if (!listData.locations || listData.locations.length === 0) break;

            // Take 5 samples per page to speed up
            for (const loc of listData.locations.slice(0, 5)) {
                try {
                    const detail = await fetchData(`/public/v1/locations/${loc.locationId}`);

                    // Skip Social Care Org and Ambulance
                    if (detail.type === 'Social Care Org' ||
                        detail.type === 'Independent Ambulance') {
                        continue;
                    }

                    const entry = {
                        type: detail.type,
                        inspectionDirectorate: detail.inspectionDirectorate || 'Unspecified',
                        careHome: detail.careHome,
                        registrationStatus: detail.registrationStatus,
                        name: detail.name,
                        serviceTypes: detail.gacServiceTypes?.map(s => s.name) || [],
                        regulatedActivities: detail.regulatedActivities?.map(a => a.name) || []
                    };

                    directorates.detailed.push(entry);

                    // Count by type + directorate
                    const key = `${detail.type} → ${detail.inspectionDirectorate || 'Unspecified'}`;
                    if (!directorates.byType[key]) {
                        directorates.byType[key] = {
                            count: 0,
                            examples: []
                        };
                    }
                    directorates.byType[key].count++;

                    if (directorates.byType[key].examples.length < 3) {
                        directorates.byType[key].examples.push({
                            name: detail.name,
                            services: detail.gacServiceTypes?.map(s => s.name).join(', ') || 'N/A'
                        });
                    }

                    totalSampled++;
                    processed++;

                    if (processed % 10 === 0) {
                        process.stdout.write(`   Analyzed ${totalSampled} relevant locations...\r`);
                    }

                    await delay(50); // Rate limiting

                } catch (err) {
                    console.error(`   ⚠️  Error fetching ${loc.locationId}: ${err.message}`);
                }
            }

            await delay(200); // Rate limiting between pages

        } catch (err) {
            console.error(`\n⚠️  Error fetching page ${page}: ${err.message}`);
        }
    }

    console.log(`\n✅ Analyzed ${totalSampled} locations (excluding Social Care & Ambulance)\n`);

    // Display results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 INSPECTION DIRECTORATES (Excluding Social Care & Ambulance)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const sorted = Object.entries(directorates.byType)
        .sort((a, b) => b[1].count - a[1].count);

    sorted.forEach(([key, data]) => {
        const pct = (data.count / totalSampled * 100).toFixed(1);
        console.log(`\n${key}`);
        console.log(`  Count: ${data.count} (${pct}%)`);
        console.log(`  Examples:`);
        data.examples.forEach(ex => {
            console.log(`    • ${ex.name}`);
            console.log(`      Services: ${ex.services}`);
        });
    });

    // Breakdown by directorate only
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📋 DIRECTORATE SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    const directorateOnly = {};
    directorates.detailed.forEach(entry => {
        const dir = entry.inspectionDirectorate;
        if (!directorateOnly[dir]) {
            directorateOnly[dir] = {
                count: 0,
                types: new Set()
            };
        }
        directorateOnly[dir].count++;
        directorateOnly[dir].types.add(entry.type);
    });

    Object.entries(directorateOnly)
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([dir, data]) => {
            const pct = (data.count / totalSampled * 100).toFixed(1);
            console.log(`${dir.padEnd(40)} ${data.count.toString().padStart(6)} (${pct}%)`);
            console.log(`  Organization types: ${Array.from(data.types).join(', ')}`);
        });

    // Find hospital examples
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏥 HOSPITAL EXAMPLES');
    console.log('═══════════════════════════════════════════════════════════\n');

    const hospitalLike = directorates.detailed.filter(entry =>
        entry.inspectionDirectorate === 'Hospitals' ||
        entry.type === 'Independent Healthcare Org' ||
        entry.regulatedActivities.some(act =>
            act.includes('Surgical') ||
            act.includes('Treatment of disease')
        )
    );

    console.log(`Found ${hospitalLike.length} potential hospitals:\n`);
    hospitalLike.slice(0, 10).forEach(h => {
        console.log(`• ${h.name}`);
        console.log(`  Type: ${h.type}`);
        console.log(`  Directorate: ${h.inspectionDirectorate}`);
        console.log(`  Services: ${h.serviceTypes.join(', ') || 'N/A'}`);
        console.log(`  Activities: ${h.regulatedActivities.slice(0, 3).join(', ')}`);
        console.log('');
    });

    // Save results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💾 SAVING ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const output = {
        metadata: {
            fetchedAt: new Date().toISOString(),
            sampleSize: totalSampled,
            excludedTypes: ['Social Care Org', 'Independent Ambulance']
        },
        directorates: directorates.byType,
        hospitalExamples: hospitalLike.slice(0, 20)
    };

    fs.writeFileSync(
        'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-directorates.json',
        JSON.stringify(output, null, 2)
    );

    console.log('✅ Analysis saved to: temp-directorates.json\n');

    // Filtering recommendations
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 FILTERING RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ CONFIRMED EXCLUSIONS:');
    console.log('   • type !== "Social Care Org"');
    console.log('   • type !== "Independent Ambulance"\n');

    console.log('📊 REMAINING DIRECTORATES TO CONSIDER:\n');
    Object.entries(directorateOnly)
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([dir, data]) => {
            const recommendation =
                dir === 'Hospitals' ? '✅ INCLUDE (hospitals)' :
                dir === 'Primary medical services' ? '❌ EXCLUDE (GP practices)' :
                dir.includes('mental health') ? '⚠️  DECIDE (mental health facilities)' :
                dir.includes('Unspecified') ? '⚠️  INSPECT (may contain hospitals)' :
                '⚠️  REVIEW';

            console.log(`   ${dir}: ${recommendation}`);
        });
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
});
