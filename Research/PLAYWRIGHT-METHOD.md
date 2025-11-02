# Playwright Method - Hospital Pricing Extraction

## Overview

**What:** Automated extraction of treatment pricing data using headless browser automation (Playwright)

**When to use:** For hospital groups that allow automated access (Ramsay, Nuffield)

**When NOT to use:** For sites with Cloudflare Bot Manager protection (Circle Health)

## How It Works

### 1. Workflow Orchestration
- Reads [hospital-urls.json](hospital-urls.json)
- Filters to hospitals with `"method": "Playwright"`
- Processes in batches of 5 hospitals at a time
- Launches 5 parallel web-researcher agents per batch

### 2. Per-Hospital Extraction
Each agent:
1. Launches headless Chromium browser
2. Navigates to hospital pricing page
3. Detects page structure (categories, accordions, lists)
4. Extracts treatment names and prices
5. Saves 3 files (CSV, screenshot, HTML)

### 3. Output Organization
Files saved to SharePoint by hospital group:
```
Private Medical Treatment - CC\
├── Ramsay\
│   ├── _RAW-DATA\          # CSV pricing data
│   ├── _SCREENSHOTS\       # Page screenshots
│   └── _HTML\              # HTML source files
├── Nuffield-Health\
│   ├── _RAW-DATA\
│   ├── _SCREENSHOTS\
│   └── _HTML\
└── Independent-Hospitals\
    └── (same structure)
```

## Compatible Hospital Groups

✅ **Ramsay Health Care** (34 hospitals)
- All hospitals accessible
- Consistent page structure
- No bot protection

✅ **Nuffield Health** (25 hospitals)
- Most hospitals accessible
- 6 URLs return 404 (see [ISSUES.md](ISSUES.md))
- Consistent page structure

❌ **Circle Health Group**
- Blocked by Cloudflare Bot Manager
- Requires alternative extraction methods

## Usage

**Quick start:**
```
Pass playwright-prompt.txt to Claude Code
Claude will:
1. Read hospital-urls.json
2. Filter to Playwright-compatible hospitals (59 total)
3. Process in 12 batches of 5
4. Create 177 files (59 × 3)
5. Generate summary report
```

**Estimated time:** 10-15 minutes for all 59 hospitals

## Output Files

**Per hospital (3 files):**
1. `{date}-{group}-{hospital}.csv` - Treatment pricing data
2. `{date}-{group}-{hospital}.png` - Page screenshot
3. `{date}-{group}-{hospital}.html` - Page source

**Example:**
- `2025-11-01-nuffield-health-exeter-hospital.csv`
- `2025-11-01-ramsay-ashtead-hospital.png`

## CSV Format

**Columns (8):**
```csv
Hospital Name,Treatment Name,Treatment Category,Price,Price Type,Notes,Page URL,Collection Date
"Exeter Hospital","Hip Replacement","Orthopaedics",18305,"From","","https://...","2025-10-31"
```

**Data Types:**
- Hospital Name: Text (with group prefix)
- Treatment Name: Text (exact from page)
- Treatment Category: Text (empty string if none)
- Price: Integer (no £, no commas)
- Price Type: Text ("From", "Guide", etc.)
- Notes: Text (empty string for now)
- Page URL: Text (full URL)
- Collection Date: Date (YYYY-MM-DD)

## Key Features

**Adaptive Extraction:**
- Detects different page structures automatically
- Works with accordions, lists, or tables
- Handles sites with or without category headings

**Price Filtering:**
- Extracts "from" prices only (no payment plans)
- Filters out finance/deposit prices
- Validates price ranges (£100-£50,000)

**Quality Assurance:**
- Screenshots for visual verification
- HTML source for debugging
- Summary report with extraction stats

## Known Limitations

**Cloudflare Protection:**
- Cannot bypass enterprise bot detection
- Affected: Circle Health Group
- Solution: Manual extraction or API partnership

**404 Errors:**
- 6 Nuffield Health URLs return 404
- May be closed hospitals or changed URLs
- Documented in [ISSUES.md](ISSUES.md)

**Price Accuracy:**
- Only "from" prices (minimum starting prices)
- Actual costs may vary based on patient factors
- Finance/payment plans excluded

## Next Steps

**After extraction:**
1. Review summary report
2. Spot-check CSV data against screenshots
3. Consolidate CSVs if needed
4. Import to database or analysis tool

**Future improvements:**
- Pre-flight URL validation (detect 404s before extraction)
- Cloudflare detection (skip blocked sites automatically)
- Price comparison across hospitals
- Treatment standardization

## Related Files

- [playwright-prompt.txt](playwright-prompt.txt) - Complete extraction instructions
- [hospital-urls.json](hospital-urls.json) - Hospital URL database
- [ISSUES.md](ISSUES.md) - Known issues and limitations
- [README.md](README.md) - Project overview

**Last Updated:** 2025-11-01
