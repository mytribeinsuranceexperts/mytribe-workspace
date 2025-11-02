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
    console.log('🔍 CQC CATEGORY ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const categories = {
        type: {},                    // Social Care Org, Independent Healthcare Org, etc
        inspectionDirectorate: {},   // Adult social care, Hospitals, etc
        careHome: { Y: 0, N: 0 },
        registrationStatus: {},      // Registered, Deregistered
        gacServiceTypes: {},         // Service types
        specialisms: {},             // Specialisms
        inspectionCategories: {},    // Inspection categories
        regulatedActivities: {}      // Regulated activities
    };

    // Fetch multiple pages to get diverse sample
    const pages = [1, 100, 500, 1000, 2000, 5000];
    let totalSampled = 0;

    for (const page of pages) {
        console.log(`📄 Fetching page ${page}...`);
        const listData = await fetchData(`/public/v1/locations?perPage=100&page=${page}`);

        if (!listData.locations || listData.locations.length === 0) break;

        for (const loc of listData.locations.slice(0, 20)) {
            try {
                const detail = await fetchData(`/public/v1/locations/${loc.locationId}`);

                // Type
                if (detail.type) {
                    categories.type[detail.type] = (categories.type[detail.type] || 0) + 1;
                }

                // Inspection Directorate
                if (detail.inspectionDirectorate) {
                    categories.inspectionDirectorate[detail.inspectionDirectorate] =
                        (categories.inspectionDirectorate[detail.inspectionDirectorate] || 0) + 1;
                }

                // Care home
                const careHome = detail.careHome || 'N';
                categories.careHome[careHome]++;

                // Registration status
                if (detail.registrationStatus) {
                    categories.registrationStatus[detail.registrationStatus] =
                        (categories.registrationStatus[detail.registrationStatus] || 0) + 1;
                }

                // Service types
                if (detail.gacServiceTypes && Array.isArray(detail.gacServiceTypes)) {
                    detail.gacServiceTypes.forEach(service => {
                        const key = `${service.name} - ${service.description || 'N/A'}`;
                        categories.gacServiceTypes[key] = (categories.gacServiceTypes[key] || 0) + 1;
                    });
                }

                // Specialisms
                if (detail.specialisms && Array.isArray(detail.specialisms)) {
                    detail.specialisms.forEach(spec => {
                        categories.specialisms[spec.name] = (categories.specialisms[spec.name] || 0) + 1;
                    });
                }

                // Inspection categories
                if (detail.inspectionCategories && Array.isArray(detail.inspectionCategories)) {
                    detail.inspectionCategories.forEach(cat => {
                        categories.inspectionCategories[cat.name] =
                            (categories.inspectionCategories[cat.name] || 0) + 1;
                    });
                }

                // Regulated activities
                if (detail.regulatedActivities && Array.isArray(detail.regulatedActivities)) {
                    detail.regulatedActivities.forEach(act => {
                        categories.regulatedActivities[act.name] =
                            (categories.regulatedActivities[act.name] || 0) + 1;
                    });
                }

                totalSampled++;
                if (totalSampled % 10 === 0) {
                    process.stdout.write(`   Analyzed ${totalSampled} locations...\r`);
                }

                await delay(50); // Rate limiting

            } catch (err) {
                console.error(`   ⚠️  Error fetching ${loc.locationId}: ${err.message}`);
            }
        }

        await delay(200); // Rate limiting between pages
    }

    console.log(`\n✅ Analyzed ${totalSampled} locations\n`);

    // Display results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ORGANIZATION TYPES');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.type)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${type.padEnd(45)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏥 INSPECTION DIRECTORATES');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.inspectionDirectorate)
        .sort((a, b) => b[1] - a[1])
        .forEach(([dir, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${dir.padEnd(45)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏠 CARE HOME STATUS');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.careHome)
        .sort((a, b) => b[1] - a[1])
        .forEach(([status, count]) => {
            const label = status === 'Y' ? 'Yes (Care Home)' : 'No (Not Care Home)';
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${label.padEnd(45)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📝 REGISTRATION STATUS');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.registrationStatus)
        .sort((a, b) => b[1] - a[1])
        .forEach(([status, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${status.padEnd(45)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔧 SERVICE TYPES (All)');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.gacServiceTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([service, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${service.padEnd(70)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📋 INSPECTION CATEGORIES (All)');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.inspectionCategories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${cat.padEnd(60)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('⚕️  REGULATED ACTIVITIES (Top 20)');
    console.log('═══════════════════════════════════════════════════════════');
    Object.entries(categories.regulatedActivities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([act, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`  ${act.padEnd(65)} ${count.toString().padStart(6)} (${pct}%)`);
        });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('💾 SAVING ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const output = {
        metadata: {
            fetchedAt: new Date().toISOString(),
            sampleSize: totalSampled,
            totalLocations: 118958,
            samplingMethod: 'Multiple pages across database'
        },
        categories
    };

    fs.writeFileSync(
        'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-full-analysis.json',
        JSON.stringify(output, null, 2)
    );

    console.log('✅ Full analysis saved to: temp-full-analysis.json\n');

    // Filtering recommendations
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 FILTERING RECOMMENDATIONS FOR HOSPITAL PRICING');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🎯 SUGGESTED FILTERS:\n');
    console.log('✅ INCLUDE:');
    console.log('   - registrationStatus === "Registered" (active only)');
    console.log('   - careHome === "N" (exclude care homes)');
    console.log('   - type === "Independent Healthcare Org" (private hospitals)\n');

    console.log('💡 ADDITIONAL FILTER OPTIONS:\n');

    console.log('   By Inspection Directorate:');
    Object.entries(categories.inspectionDirectorate)
        .sort((a, b) => b[1] - a[1])
        .forEach(([dir, count]) => {
            console.log(`      • ${dir} (${count} in sample)`);
        });

    console.log('\n   By Inspection Category:');
    Object.entries(categories.inspectionCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([cat, count]) => {
            console.log(`      • ${cat} (${count} in sample)`);
        });
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
});
