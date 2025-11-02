/**
 * Fetch All UK Private Hospitals (v2) - Including Facilities Without Beds
 *
 * VERSION 2 CHANGES:
 * - Includes ALL private healthcare facilities (removed numberOfBeds > 0 filter)
 * - Captures day surgery centers, outpatient clinics, diagnostic centers
 * - Fixed region names to match CQC API expectations
 * - Outputs to CSV format for easy analysis
 *
 * Filters:
 * - All UK regions
 * - Inspection Directorate: Hospitals
 * - Type: Independent Healthcare Org (private, not NHS)
 * - Registration Status: Registered (active only)
 * - NO bed count filter (includes 0-bed facilities)
 */

const fs = require('fs');
const API_BASE = 'https://api.service.cqc.org.uk/public/v1';
const SUBSCRIPTION_KEY = 'f66d77340c8b4134a758513607afba55';

// FIXED: Region names that match CQC API exactly (verified from API responses)
const UK_REGIONS = [
    'London',
    'South East',
    'South West',
    'East',  // NOTE: Not "East of England"
    'West Midlands',
    'East Midlands',
    'Yorkshire & Humberside',  // NOTE: Uses '&' and 'Humberside', not 'and the Humber'
    'North West',
    'North East'
];

// Cache for provider data to avoid duplicate API calls
const providerCache = {};

async function fetchWithRetry(url, headers, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                if (response.status === 429 && attempt < maxRetries) {
                    console.log(`  ⚠️  Rate limited, waiting ${2 * attempt}s...`);
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                    continue;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            console.log(`  ⚠️  Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

async function getProviderDetails(providerId) {
    if (providerCache[providerId]) {
        return providerCache[providerId];
    }

    try {
        const url = `${API_BASE}/providers/${providerId}`;
        const data = await fetchWithRetry(url, {
            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
            'Accept': 'application/json'
        });

        providerCache[providerId] = {
            providerId: data.providerId,
            providerName: data.name,
            companiesHouseNumber: data.companiesHouseNumber || '',
            website: data.website || ''
        };

        return providerCache[providerId];
    } catch (error) {
        console.error(`  ❌ Error fetching provider ${providerId}:`, error.message);
        return {
            providerId: providerId,
            providerName: 'Unknown Provider',
            companiesHouseNumber: '',
            website: ''
        };
    }
}

async function fetchRegionHospitals(region) {
    const hospitals = [];
    let page = 1;
    let totalPages = 1;

    console.log(`\n📍 Fetching ${region}...`);

    while (page <= totalPages) {
        const url = `${API_BASE}/locations?region=${encodeURIComponent(region)}&inspectionDirectorate=Hospitals&perPage=100&page=${page}`;

        const data = await fetchWithRetry(url, {
            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
            'Accept': 'application/json'
        });

        totalPages = data.totalPages;
        console.log(`  📄 Page ${page}/${totalPages} (${data.locations.length} locations)`);

        // Fetch full details for each location (with progress indicator)
        for (let i = 0; i < data.locations.length; i++) {
            const location = data.locations[i];

            // Progress indicator for long pages
            if (i > 0 && i % 20 === 0) {
                process.stdout.write(`     Processing: ${i}/${data.locations.length}...\r`);
            }

            const detailUrl = `${API_BASE}/locations/${location.locationId}`;
            const details = await fetchWithRetry(detailUrl, {
                'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
                'Accept': 'application/json'
            });

            // Filter: All active private healthcare facilities
            // REMOVED: numberOfBeds > 0 filter (v2 change)
            if (details.type === 'Independent Healthcare Org' &&
                details.registrationStatus === 'Registered' &&
                !details.deregistrationDate) {

                // Get provider details
                const provider = await getProviderDetails(details.providerId);

                // Extract service types
                const serviceTypes = (details.gacServiceTypes || []).map(st => st.name).join('; ');
                const specialisms = (details.specialisms || []).map(sp => sp.name).join('; ');

                hospitals.push({
                    // CQC IDs
                    cqcLocationId: details.locationId,
                    cqcProviderId: details.providerId,

                    // Names
                    hospitalName: details.name,
                    providerName: provider.providerName,

                    // Location
                    addressLine1: details.postalAddressLine1 || '',
                    addressLine2: details.postalAddressLine2 || '',
                    townCity: details.postalAddressTownCity || '',
                    county: details.postalAddressCounty || '',
                    postalCode: details.postalCode || '',
                    region: details.region || region,
                    localAuthority: details.localAuthority || '',
                    constituency: details.constituency || '',

                    // Coordinates
                    latitude: details.onspdLatitude || '',
                    longitude: details.onspdLongitude || '',

                    // Contact
                    phone: details.mainPhoneNumber || '',
                    website: details.website || provider.website,

                    // Facility Details
                    numberOfBeds: details.numberOfBeds || 0,  // 0 for non-bed facilities
                    hasBeds: details.numberOfBeds > 0 ? 'Yes' : 'No',
                    registrationDate: details.registrationDate || '',

                    // Rating
                    rating: details.currentRatings?.overall?.rating || 'Not rated',
                    ratingDate: details.currentRatings?.overall?.reportDate || '',

                    // Services
                    serviceTypes: serviceTypes,
                    specialisms: specialisms,

                    // Corporate
                    companiesHouseNumber: provider.companiesHouseNumber,

                    // Metadata
                    lastUpdated: new Date().toISOString()
                });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        page++;
    }

    return hospitals;
}

function convertToCSV(hospitals) {
    if (hospitals.length === 0) {
        return '';
    }

    // CSV Headers
    const headers = [
        'CQC Location ID',
        'CQC Provider ID',
        'Hospital Name',
        'Provider Name',
        'Address Line 1',
        'Address Line 2',
        'Town/City',
        'County',
        'Postal Code',
        'Region',
        'Local Authority',
        'Constituency',
        'Latitude',
        'Longitude',
        'Phone',
        'Website',
        'Number of Beds',
        'Has Beds',
        'Registration Date',
        'Rating',
        'Rating Date',
        'Service Types',
        'Specialisms',
        'Companies House Number',
        'Last Updated'
    ];

    // Escape CSV values
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Build CSV rows
    const rows = [headers.join(',')];

    hospitals.forEach(hospital => {
        const row = [
            hospital.cqcLocationId,
            hospital.cqcProviderId,
            hospital.hospitalName,
            hospital.providerName,
            hospital.addressLine1,
            hospital.addressLine2,
            hospital.townCity,
            hospital.county,
            hospital.postalCode,
            hospital.region,
            hospital.localAuthority,
            hospital.constituency,
            hospital.latitude,
            hospital.longitude,
            hospital.phone,
            hospital.website,
            hospital.numberOfBeds,
            hospital.hasBeds,
            hospital.registrationDate,
            hospital.rating,
            hospital.ratingDate,
            hospital.serviceTypes,
            hospital.specialisms,
            hospital.companiesHouseNumber,
            hospital.lastUpdated
        ].map(escapeCSV);

        rows.push(row.join(','));
    });

    return rows.join('\n');
}

async function main() {
    try {
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║  UK Private Hospitals Extraction v2                    ║');
        console.log('║  Includes ALL facilities (with and without beds)       ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');

        const allHospitals = [];
        const stats = {
            withBeds: 0,
            withoutBeds: 0,
            totalBeds: 0
        };

        // Fetch from all UK regions
        for (const region of UK_REGIONS) {
            const regionHospitals = await fetchRegionHospitals(region);
            allHospitals.push(...regionHospitals);

            const withBeds = regionHospitals.filter(h => h.numberOfBeds > 0).length;
            const withoutBeds = regionHospitals.length - withBeds;
            const beds = regionHospitals.reduce((sum, h) => sum + h.numberOfBeds, 0);

            stats.withBeds += withBeds;
            stats.withoutBeds += withoutBeds;
            stats.totalBeds += beds;

            console.log(`  ✅ ${region}: ${regionHospitals.length} facilities (${withBeds} with beds, ${withoutBeds} without)`);
        }

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log(`║  EXTRACTION COMPLETE                                   ║`);
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n📊 Summary:`);
        console.log(`   Total facilities: ${allHospitals.length}`);
        console.log(`   Facilities with beds: ${stats.withBeds} (${stats.totalBeds} beds)`);
        console.log(`   Facilities without beds: ${stats.withoutBeds}`);
        console.log(`   Unique providers: ${new Set(allHospitals.map(h => h.cqcProviderId)).size}`);

        // Rating breakdown
        const ratingBreakdown = {};
        allHospitals.forEach(h => {
            ratingBreakdown[h.rating] = (ratingBreakdown[h.rating] || 0) + 1;
        });
        console.log(`\n📈 Rating Breakdown:`);
        Object.entries(ratingBreakdown).sort((a, b) => b[1] - a[1]).forEach(([rating, count]) => {
            console.log(`   ${rating}: ${count}`);
        });

        // Save CSV
        const timestamp = new Date().toISOString().split('T')[0];
        const csvPath = `uk_private_hospitals_all_${timestamp}.csv`;
        const csvContent = convertToCSV(allHospitals);
        fs.writeFileSync(csvPath, csvContent);
        console.log(`\n💾 Saved to: APIs/CQC/${csvPath}`);

        // Also save JSON for programmatic use
        const jsonPath = `uk_private_hospitals_all_${timestamp}.json`;
        fs.writeFileSync(jsonPath, JSON.stringify(allHospitals, null, 2));
        console.log(`💾 Saved to: APIs/CQC/${jsonPath}`);

        // Generate summary report
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('KEY DIFFERENCES FROM V1:');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ Included ${stats.withoutBeds} facilities WITHOUT beds`);
        console.log('✅ Fixed region name (Yorkshire and the Humber)');
        console.log('✅ CSV output format for easy analysis');
        console.log('✅ Enhanced metadata (coordinates, service types, etc.)');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
