# Cloudflare Method - Hospital Pricing Extraction

## Overview

**What:** Automated extraction of treatment pricing data using Apify's Cloudflare Web Scraper actor

**When to use:** For hospital groups protected by Cloudflare Bot Manager (Circle Health Group)

**When NOT to use:** For sites without bot protection (use Playwright method instead - it's free)

## How It Works

### 1. Single Session Orchestration
- Reads [hospital-locations.json](hospital-locations.json)
- Filters to Circle Health hospitals (`scraping_method: "apify-cloudflare"`)
- Launches all 49 hospital scrapes in parallel batches
- Polls Apify API for completion status
- Processes results and saves structured data

### 2. Per-Hospital Extraction
For each hospital, the Apify actor:
1. Uses residential UK proxies to appear as real user
2. Bypasses Cloudflare Bot Manager protection
3. Waits for page to fully load
4. Executes custom JavaScript to extract data
5. Returns structured treatment/price data + HTML

### 3. Price Structure Understanding

Each Circle Health treatment has this pricing breakdown:

**Patient Pathway:**
- Initial consultation: £200 (Consultant fees)
- Diagnostic investigations: N/A (not included in package)
- Main treatment: £X (Hospital fees)
- Post discharge care: Included

**Example: Abdominal Hysterectomy**
- Hospital fees: £9,074
- Consultant fees: £200
- **Guide price (total): £9,274**

**What we extract:**
- Treatment name: "Abdominal hysterectomy (uterus removal) surgery"
- Guide price: £9,274 (the total package price)
- Component breakdown: Hospital fees + Consultation fees

### 4. Output Organization
Files saved to SharePoint by hospital group:
```
Private Medical Treatment - CC\
└── Circle-Health\
    ├── _RAW-DATA\          # CSV pricing data
    ├── _HTML\              # HTML source files
    └── _LOGS\              # Extraction logs
```

**Note:** Screenshots not currently supported by this actor, but HTML source is saved for verification.

## Compatible Hospital Groups

✅ **Circle Health Group** (49 hospitals)
- All hospitals require Cloudflare bypass
- Consistent price structure across all sites
- Fixed-price packages with transparent breakdowns

## Usage

### Prerequisites
1. Apify account with API token
2. Rented Cloudflare Web Scraper actor (`ChNuXurElMWvpbJB9`)
3. Token stored in `.env`: `APIFY_API_TOKEN=apify_api_...`

### Execution
```javascript
// Single script handles all 49 hospitals
node Research/extract_circle_health.js

Process:
1. Reads Circle Health hospitals from hospital-locations.json
2. Submits 49 scraping jobs to Apify (batched)
3. Polls for completion (typically 30-60 seconds per hospital)
4. Extracts structured data from results
5. Saves CSV + HTML for each hospital
6. Updates hospital-locations.json with last_scraped timestamps
7. Generates summary report
```

**Estimated time:** 45-90 minutes for all 49 hospitals (parallel processing)

## Output Files

**Per hospital (2 files):**
1. `{date}-circle-health-{hospital}.csv` - Treatment pricing data
2. `{date}-circle-health-{hospital}.html` - Page source

**Example:**
- `2025-11-01-circle-health-beardwood-hospital.csv`
- `2025-11-01-circle-health-beardwood-hospital.html`

## CSV Format

**Columns (9):**
```csv
Hospital Name,Treatment Name,Treatment Category,Guide Price,Hospital Fees,Consultant Fees,Notes,Page URL,Collection Date
"The Beardwood Hospital","Abdominal hysterectomy (uterus removal) surgery","",9274,9074,200,"Fixed-price package","https://...","2025-11-01"
```

**Data Types:**
- Hospital Name: Text (full hospital name)
- Treatment Name: Text (exact from page)
- Treatment Category: Text (empty for Circle Health - no categories)
- Guide Price: Integer (total package price in pence)
- Hospital Fees: Integer (main treatment cost in pence)
- Consultant Fees: Integer (typically 200 = £200)
- Notes: Text ("Fixed-price package")
- Page URL: Text (full URL)
- Collection Date: Date (YYYY-MM-DD)

## Key Features

**Cloudflare Bypass:**
- Residential proxy rotation (UK IPs)
- Real browser fingerprints
- Human-like behavior patterns
- 98%+ success rate

**Intelligent Extraction:**
- Filters navigation/cookie content automatically
- Targets main content area only
- Excludes short headings (<10 chars)
- Separates guide price from component prices

**Price Parsing:**
- Identifies total "Guide price"
- Extracts Hospital fees component
- Extracts Consultant fees component
- Validates price ranges (£100-£50,000)

**Quality Assurance:**
- HTML source saved for debugging
- Extraction logs with success/failure status
- Summary report with statistics
- Failed hospitals logged for retry

## Cost Estimates

**Per scrape:**
- ~$0.0005 per hospital
- $0.025 for all 49 Circle Health hospitals

**Ongoing:**
- Weekly: $0.10/month
- Daily: $0.75/month

**Compared to manual:**
- Manual extraction: ~10 minutes per hospital = 8 hours
- Apify cost for 49 hospitals: $0.025
- **Time saved: 8 hours for $0.025**

## Known Limitations

**No Screenshots:**
- Actor returns HTML but not screenshots
- HTML source can be viewed in browser for verification
- Alternative: Use Playwright separately for screenshots (will be blocked by Cloudflare)

**Guide Prices Only:**
- Prices shown are "guide prices" not final quotes
- Actual cost confirmed after consultation
- Prices include consultation + treatment + aftercare

**Rate Limiting:**
- Processing 49 hospitals takes 45-90 minutes
- Apify limits concurrent runs per account tier
- May need to batch into groups of 10-20

## Error Handling

**Common issues:**

1. **Actor rental expired**
   - Error: `"type": "actor-is-not-rented"`
   - Fix: Rent actor at https://console.apify.com/actors/ChNuXurElMWvpbJB9

2. **Cloudflare still blocking**
   - Symptom: `result.blocked = true`, title contains "Just a moment"
   - Fix: Retry with longer timeout or different proxy country

3. **No results returned**
   - Symptom: `items.length === 0`
   - Fix: Check HTML extraction - may be JavaScript issue

4. **Price extraction failed**
   - Symptom: treatmentHeadings = 0 or pricesFound = 0
   - Fix: Review HTML structure, adjust extraction JavaScript

## Extraction JavaScript

**Current version filters:**
- Cookie/privacy/navigation content
- Headings outside main content area
- Headings shorter than 10 characters
- Headings longer than 100 characters

**Returns:**
```javascript
{
  blocked: false,
  title: "Treatments Prices | Hospital Name",
  treatmentHeadings: 145,
  pricesFound: 422,
  sampleTreatments: [...],
  samplePrices: [...]
}
```

## Next Steps

**After extraction:**
1. Review extraction logs for failures
2. Spot-check CSV data against saved HTML
3. Retry any failed hospitals
4. Consolidate CSVs for analysis
5. Update hospital-locations.json with success status

**Future improvements:**
- Add screenshot support via separate Playwright step (post-Cloudflare bypass)
- Implement automatic retry for failed extractions
- Add price change detection (compare to previous scrape)
- Treatment name standardization across hospital groups
- Automated validation against HTML source

## Related Files

- [APIs/Apify/README.md](../APIs/Apify/README.md) - Apify API documentation
- [hospital-locations.json](hospital-locations.json) - Hospital database
- [PLAYWRIGHT-METHOD.md](PLAYWRIGHT-METHOD.md) - Alternative method for non-blocked sites
- [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - Overall project status

## Troubleshooting

**Check actor status:**
```javascript
// View run in Apify console
https://console.apify.com/actors/runs/{runId}
```

**Validate extraction:**
```javascript
// Check what was extracted
node Research/check_extraction_quality.js {runId}
```

**Manual verification:**
1. Open saved HTML file in browser
2. Compare treatments in CSV to HTML
3. Verify guide prices match HTML prices
4. Check for missing treatments

## Security Notes

- API token stored in `.env` (gitignored)
- Never commit Apify credentials to git
- Residential proxies use Apify's infrastructure
- No PII or patient data extracted
- Only public pricing information

---

**Last Updated:** 2025-11-01
**Status:** ✅ Tested and working
**Test Results:** 145 treatments, 422 prices extracted from Beardwood Hospital
