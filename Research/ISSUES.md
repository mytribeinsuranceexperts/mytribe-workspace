# Known Issues & Limitations

## Cloudflare Bot Protection

**Circle Health Group** - All sites blocked
- **Issue:** Enterprise Cloudflare Bot Manager detects headless browsers
- **Status:** Cannot be bypassed with standard Playwright
- **Example:** The Beardwood Hospital (403 Forbidden)
- **Workarounds:**
  - Manual data collection via browser
  - Contact hospital group for API access
  - Use commercial scraping services (Bright Data, Apify)

## Price Accuracy

**"From" Prices Only**
- Extracts minimum starting prices
- Actual costs may vary based on:
  - Patient-specific factors
  - Procedure complexity
  - Additional services required
  - Consultant fees

**Excluded:**
- Finance/payment plan prices
- Monthly payment options
- Deposit amounts
- Insurance pricing tiers

## 404 Errors - Missing Pricing Pages

**Nuffield Health Hospitals** - Some URLs return 404:
- Hull Hospital (`/hospitals/hull/pricing`)
- Liverpool Hospital (`/hospitals/liverpool/pricing`)
- Manchester Hospital (`/hospitals/manchester/pricing`)
- Stoke on Trent Hospital (`/hospitals/stoke-on-trent/pricing`)
- Swindon Hospital (`/hospitals/swindon/pricing`)
- The Manor Hospital (`/hospitals/the-manor/pricing`)

**Possible causes:**
- Hospital closed or merged
- URL slug changed
- Pricing page not published
- Hospital removed from Nuffield network

**Action:** Verify current hospital status and correct URLs on Nuffield Health website

## Category Detection

**Variable Structure**
- Not all hospitals use category headings
- Some group by specialty, others don't
- Empty `treatmentCategory` field when categories not detected

## Browser Compatibility

**Requires:**
- Chromium-based browser (Playwright)
- JavaScript enabled
- Network idle detection

## Future Improvements

- [ ] Pre-flight accessibility checker
- [ ] Cloudflare detection before full extraction
- [ ] Automatic retry logic for network failures
- [ ] Support for additional hospital groups
- [ ] Price comparison across hospitals
- [ ] Validate 404 URLs and remove from hospital-urls.json

**Last Updated:** 2025-11-01
