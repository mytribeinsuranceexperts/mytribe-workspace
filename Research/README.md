# Hospital Pricing Extraction

**Status:** Production Ready | **Last Updated:** 2025-11-01

Automated extraction of treatment pricing from 157 UK private hospitals across 4 major groups.

## Extraction Methods

### Hybrid Approach (Apify + Playwright)

**Apify Method** - 121 hospitals (77%)
- Groups: Ramsay (34), Nuffield (37), Circle (49)
- Cost: $0.06/run ($0.24/month weekly)
- Speed: ~15s per hospital
- Uses Cloudflare Web Scraper actor

**Playwright Method** - 37 hospitals (23%)
- Groups: **Spire Healthcare only** (37)
- Cost: $0 (local execution)
- Speed: ~3-4 min per hospital
- **Required for Spire:** Prices loaded via AJAX after accordion clicks

### Why Different Approach for Spire?

Spire loads prices **dynamically via AJAX** when accordions are clicked:
- Initial HTML contains 0 prices (confirmed in 344KB analysis)
- 40 `js-getprices` buttons trigger AJAX calls
- Apify actor cannot execute site's JavaScript to trigger these calls
- **Solution:** Playwright with real browser clicks accordions → waits for AJAX → extracts prices

## Quick Start

**Spire Extraction (Playwright):**
```bash
node production/extract_spire_hospitals.js
```

**Other Groups (Apify):**
```bash
# Coming soon
node production/extract_apify_hospitals.js
```

## Documentation

**Core Methods:**
- [CLOUDFLARE-METHOD.md](CLOUDFLARE-METHOD.md) - Apify extraction (Ramsay, Nuffield, Circle)
- [PLAYWRIGHT-METHOD.md](PLAYWRIGHT-METHOD.md) - Browser automation (Spire only)

**Analysis:**
- [multi-group-test-analysis.md](multi-group-test-analysis.md) - Test results (10 hospitals)
- [spire-investigation-summary.md](spire-investigation-summary.md) - Why Spire needs Playwright
- [APIFY-VS-PLAYWRIGHT-COMPARISON.md](APIFY-VS-PLAYWRIGHT-COMPARISON.md) - Cost/benefit analysis

## File Organization

```
Research/
├── production/                    # Production scripts
│   └── extract_spire_hospitals.js
├── test-scripts/                  # Archived test files
├── hospital-locations.json        # 157 hospital URLs
├── CLOUDFLARE-METHOD.md
├── PLAYWRIGHT-METHOD.md
└── README.md
```

## Test Results (10 Hospitals)

| Group | Tested | Success | Method | Treatments | Prices | Notes |
|-------|--------|---------|--------|------------|--------|-------|
| Ramsay | 2 | 2 | Apify | 138 avg | 161 avg | Table extraction |
| Nuffield | 3 | 3 | Apify | 7 avg | 31 avg | Clean |
| Circle | 2 | 2 | Apify | 92 avg | 264 avg | Perfect |
| **Spire** | **3** | **0** | **Apify** | **60 avg** | **0** | **Requires Playwright** |

**Spire Playwright Test:** 1 hospital, 5 accordions tested, 42 prices extracted ✅

## Cost Analysis

| Method | Hospitals | Weekly Cost | Annual Cost |
|--------|-----------|-------------|-------------|
| Apify | 121 | $0.06 | $3.12 |
| Playwright | 37 | $0 | $0 |
| **Total** | **157** | **$0.06** | **$3.12** |

## Archive

Test scripts and analysis files archived in `test-scripts/` directory.
