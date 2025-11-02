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
    console.log('🔍 NHS vs PRIVATE ORGANIZATION TYPES');
    console.log('═══════════════════════════════════════════════════════════\n');

    const types = {
        all: {},
        examples: {}
    };

    let totalSampled = 0;
    const targetSamples = 150;

    for (let page = 1; page <= 100 && totalSampled < targetSamples; page++) {
        try {
            const listData = await fetchData(`/public/v1/locations?perPage=100&page=${page * 3}`);

            if (!listData.locations || listData.locations.length === 0) break;

            for (const loc of listData.locations.slice(0, 2)) {
                if (totalSampled >= targetSamples) break;

                try {
                    const detail = await fetchData(`/public/v1/locations/${loc.locationId}`);

                    const orgType = detail.type || 'Unknown';

                    if (!types.all[orgType]) {
                        types.all[orgType] = 0;
                        types.examples[orgType] = [];
                    }

                    types.all[orgType]++;

                    if (types.examples[orgType].length < 5) {
                        types.examples[orgType].push({
                            name: detail.name,
                            careHome: detail.careHome,
                            directorate: detail.inspectionDirectorate || 'Unspecified',
                            services: detail.gacServiceTypes?.map(s => s.name).slice(0, 2).join(', ') || 'N/A'
                        });
                    }

                    totalSampled++;
                    if (totalSampled % 10 === 0) {
                        process.stdout.write(`   Analyzed ${totalSampled} locations...\r`);
                    }

                    await delay(50);

                } catch (err) {
                    // Skip errors
                }
            }

            await delay(200);

        } catch (err) {
            console.error(`\n⚠️  Error: ${err.message}`);
        }
    }

    console.log(`\n✅ Analyzed ${totalSampled} locations\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ALL ORGANIZATION TYPES FOUND');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(types.all)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            const pct = (count / totalSampled * 100).toFixed(1);
            console.log(`\n${type} - ${count} (${pct}%)`);
            console.log('─'.repeat(70));

            types.examples[type].forEach(ex => {
                console.log(`  • ${ex.name}`);
                console.log(`    Directorate: ${ex.directorate} | Care Home: ${ex.careHome || 'N'}`);
                console.log(`    Services: ${ex.services}`);
            });
        });

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('🎯 KEY FINDINGS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const hasNHS = Object.keys(types.all).some(t =>
        t.toLowerCase().includes('nhs') ||
        t.toLowerCase().includes('healthcare organisation')
    );

    if (hasNHS) {
        console.log('✅ NHS organization types FOUND in data');
        Object.keys(types.all)
            .filter(t => t.toLowerCase().includes('nhs') || t.toLowerCase().includes('healthcare organisation'))
            .forEach(t => {
                console.log(`   • ${t} (${types.all[t]} samples)`);
            });
    } else {
        console.log('⚠️  No explicit "NHS" organization type found');
        console.log('   NHS services likely categorized as:');
        console.log('   • Primary Medical Services (NHS GPs)');
        console.log('   • Primary Dental Care (NHS & Private dentists mixed)');
    }

    console.log('\n📋 ORGANIZATION TYPE CATEGORIES:\n');

    const categories = {
        'Private Healthcare': [],
        'NHS/Public': [],
        'Primary Care': [],
        'Social Care': [],
        'Other': []
    };

    Object.keys(types.all).forEach(type => {
        if (type.includes('Independent Healthcare') || type.includes('Independent Ambulance')) {
            categories['Private Healthcare'].push(type);
        } else if (type.includes('NHS') || type.includes('Healthcare Organisation')) {
            categories['NHS/Public'].push(type);
        } else if (type.includes('Primary Medical') || type.includes('Primary Dental')) {
            categories['Primary Care'].push(type);
        } else if (type.includes('Social Care')) {
            categories['Social Care'].push(type);
        } else {
            categories['Other'].push(type);
        }
    });

    Object.entries(categories).forEach(([cat, typeList]) => {
        if (typeList.length > 0) {
            console.log(`${cat}:`);
            typeList.forEach(t => {
                console.log(`  • ${t} (${types.all[t]} samples)`);
            });
            console.log('');
        }
    });

    // Save
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💾 SAVING ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const output = {
        metadata: {
            fetchedAt: new Date().toISOString(),
            sampleSize: totalSampled
        },
        organizationTypes: types
    };

    fs.writeFileSync(
        'c:\\Users\\chris\\myTribe-Development\\APIs\\CQC\\temp-nhs-check.json',
        JSON.stringify(output, null, 2)
    );

    console.log('✅ Analysis saved to: temp-nhs-check.json\n');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
});
