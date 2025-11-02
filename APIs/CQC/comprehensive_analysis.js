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
    console.log('🔍 COMPREHENSIVE CQC CATEGORY ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Analyzing ALL organization types (excluding Social Care Org)\n');

    const analysis = {
        byTypeAndDirectorate: {},
        byServiceType: {},
        unspecifiedDirectorate: [],
        hospitalsDirectorate: [],
        primaryMedicalDirectorate: [],
        allSamples: []
    };

    let totalSampled = 0;
    const targetSamples = 200; // Get 200 samples

    // Fetch from multiple pages
    for (let page = 1; page <= 100 && totalSampled < targetSamples; page++) {
        try {
            const listData = await fetchData(`/public/v1/locations?perPage=100&page=${page * 5}`);

            if (!listData.locations || listData.locations.length === 0) break;

            for (const loc of listData.locations.slice(0, 3)) {
                if (totalSampled >= targetSamples) break;

                try {
                    const detail = await fetchData(`/public/v1/locations/${loc.locationId}`);

                    // Skip Social Care Org and Ambulance
                    if (detail.type === 'Social Care Org' ||
                        detail.type === 'Independent Ambulance') {
                        continue;
                    }

                    const entry = {
                        locationId: detail.locationId,
                        name: detail.name,
                        type: detail.type,
                        inspectionDirectorate: detail.inspectionDirectorate || 'Unspecified',
                        careHome: detail.careHome,
                        registrationStatus: detail.registrationStatus,
                        serviceTypes: detail.gacServiceTypes?.map(s => s.name) || [],
                        serviceDescriptions: detail.gacServiceTypes?.map(s =>
                            `${s.name}: ${s.description || 'N/A'}`
                        ) || [],
                        regulatedActivities: detail.regulatedActivities?.map(a => a.name) || [],
                        specialisms: detail.specialisms?.map(s => s.name) || []
                    };

                    analysis.allSamples.push(entry);

                    // Categorize by type + directorate
                    const key = `${detail.type}`;
                    const dirKey = detail.inspectionDirectorate || 'Unspecified';

                    if (!analysis.byTypeAndDirectorate[key]) {
                        analysis.byTypeAndDirectorate[key] = {};
                    }
                    if (!analysis.byTypeAndDirectorate[key][dirKey]) {
                        analysis.byTypeAndDirectorate[key][dirKey] = {
                            count: 0,
                            examples: []
                        };
                    }

                    analysis.byTypeAndDirectorate[key][dirKey].count++;
                    if (analysis.byTypeAndDirectorate[key][dirKey].examples.length < 5) {
                        analysis.byTypeAndDirectorate[key][dirKey].examples.push({
                            name: detail.name,
                            services: detail.gacServiceTypes?.map(s => s.name).join(', ') || 'N/A',
                            activities: detail.regulatedActivities?.map(a => a.name).slice(0, 3).join(', ') || 'N/A'
                        });
                    }

                    // Categorize by service type
                    if (detail.gacServiceTypes) {
                        detail.gacServiceTypes.forEach(service => {
                            const svcKey = `${service.name}: ${service.description || 'N/A'}`;
                            if (!analysis.byServiceType[svcKey]) {
                                analysis.byServiceType[svcKey] = {
                                    count: 0,
                                    types: new Set(),
                                    directorates: new Set()
                                };
                            }
                            analysis.byServiceType[svcKey].count++;
                            analysis.byServiceType[svcKey].types.add(detail.type);
                            analysis.byServiceType[svcKey].directorates.add(dirKey);
                        });
                    }

                    // Group by directorate
                    if (dirKey === 'Unspecified') {
                        analysis.unspecifiedDirectorate.push(entry);
                    } else if (dirKey === 'Hospitals') {
                        analysis.hospitalsDirectorate.push(entry);
                    } else if (dirKey === 'Primary medical services') {
                        analysis.primaryMedicalDirectorate.push(entry);
                    }

                    totalSampled++;
                    if (totalSampled % 10 === 0) {
                        process.stdout.write(`   Analyzed ${totalSampled} locations...\r`);
                    }

                    await delay(50);

                } catch (err) {
                    // Skip errors silently
                }
            }

            await delay(200);

        } catch (err) {
            console.error(`\n⚠️  Error fetching page ${page}: ${err.message}`);
        }
    }

    console.log(`\n✅ Analyzed ${totalSampled} locations (excluding Social Care Org & Ambulance)\n`);

    // Display results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ORGANIZATION TYPES × INSPECTION DIRECTORATES');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(analysis.byTypeAndDirectorate)
        .sort((a, b) => {
            const aTotal = Object.values(a[1]).reduce((sum, v) => sum + v.count, 0);
            const bTotal = Object.values(b[1]).reduce((sum, v) => sum + v.count, 0);
            return bTotal - aTotal;
        })
        .forEach(([type, directorates]) => {
            const total = Object.values(directorates).reduce((sum, v) => sum + v.count, 0);
            console.log(`\n${type} (${total} samples)`);
            console.log('─'.repeat(70));

            Object.entries(directorates)
                .sort((a, b) => b[1].count - a[1].count)
                .forEach(([dir, data]) => {
                    const pct = (data.count / totalSampled * 100).toFixed(1);
                    console.log(`\n  ${dir} - ${data.count} (${pct}%)`);
                    data.examples.forEach(ex => {
                        console.log(`    • ${ex.name}`);
                        console.log(`      Services: ${ex.services}`);
                        console.log(`      Activities: ${ex.activities}`);
                    });
                });
        });

    // Service types breakdown
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('🔧 ALL SERVICE TYPES');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(analysis.byServiceType)
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([service, data]) => {
            const pct = (data.count / totalSampled * 100).toFixed(1);
            console.log(`\n${service} (${data.count} - ${pct}%)`);
            console.log(`  Org types: ${Array.from(data.types).join(', ')}`);
            console.log(`  Directorates: ${Array.from(data.directorates).join(', ')}`);
        });

    // Detailed breakdowns
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('🏥 HOSPITALS DIRECTORATE DETAILS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Found ${analysis.hospitalsDirectorate.length} locations:\n`);
    analysis.hospitalsDirectorate.forEach(h => {
        console.log(`• ${h.name}`);
        console.log(`  Type: ${h.type}`);
        console.log(`  Services: ${h.serviceTypes.join(', ') || 'N/A'}`);
        console.log(`  Activities: ${h.regulatedActivities.slice(0, 3).join(', ') || 'N/A'}`);
        console.log('');
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('❓ UNSPECIFIED DIRECTORATE DETAILS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Found ${analysis.unspecifiedDirectorate.length} locations:\n`);
    analysis.unspecifiedDirectorate.slice(0, 20).forEach(u => {
        console.log(`• ${u.name}`);
        console.log(`  Type: ${u.type}`);
        console.log(`  Services: ${u.serviceTypes.join(', ') || 'N/A'}`);
        console.log(`  Activities: ${u.regulatedActivities.slice(0, 3).join(', ') || 'N/A'}`);
        console.log('');
    });

    // Save
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💾 SAVING COMPREHENSIVE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Convert Sets to Arrays for JSON
    Object.keys(analysis.byServiceType).forEach(key => {
        analysis.byServiceType[key].types = Array.from(analysis.byServiceType[key].types);
        analysis.byServiceType[key].directorates = Array.from(analysis.byServiceType[key].directorates);
    });

    const output = {
        metadata: {
            fetchedAt: new Date().toISOString(),
            sampleSize: totalSampled,
            excludedTypes: ['Social Care Org', 'Independent Ambulance']
        },
        analysis
    };

    fs.writeFileSync(
        'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-comprehensive.json',
        JSON.stringify(output, null, 2)
    );

    console.log('✅ Comprehensive analysis saved to: temp-comprehensive.json\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 SUMMARY & RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Organization types found (excluding Social Care Org & Ambulance):');
    Object.keys(analysis.byTypeAndDirectorate)
        .sort()
        .forEach(type => {
            console.log(`  • ${type}`);
        });

    console.log('\nInspection directorates found:');
    const allDirectorates = new Set();
    Object.values(analysis.byTypeAndDirectorate).forEach(dirs => {
        Object.keys(dirs).forEach(dir => allDirectorates.add(dir));
    });
    Array.from(allDirectorates).sort().forEach(dir => {
        console.log(`  • ${dir}`);
    });
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
});
