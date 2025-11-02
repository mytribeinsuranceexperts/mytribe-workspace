# Apify API Integration

Quick reference for using Apify actors in the myTribe workspace.

## Authentication

**API Token:** Stored in `.env` file at workspace root
```
APIFY_API_TOKEN=apify_api_...
```

**Get token:** https://console.apify.com/account/integrations

---

## Cloudflare Web Scraper Actor

**Actor ID:** `ChNuXurElMWvpbJB9`
**Purpose:** Bypass Cloudflare Bot Manager protection on websites
**Use case:** Scraping Circle Health Group pricing pages

### Basic Usage (API)

```javascript
const response = await fetch(`https://api.apify.com/v2/acts/ChNuXurElMWvpbJB9/runs`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${APIFY_API_TOKEN}`
  },
  body: JSON.stringify({
    max_retries_per_url: 2,
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
      apifyProxyCountry: "GB" // Match target country
    },
    urls: ["https://example.com"],
    js_script: "return document.title;",
    js_timeout: 15,
    retrieve_result_from_js_script: true,
    page_is_loaded_before_running_script: true,
    execute_js_async: false,
    retrieve_html_from_url_after_loaded: true
  })
});
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | array | ✅ | List of URLs to scrape |
| `proxy` | object | ✅ | Proxy configuration |
| `max_retries_per_url` | number | ❌ | Retry attempts (default: 2) |
| `js_script` | string | ❌ | Custom JavaScript to run on page |
| `js_timeout` | number | ❌ | JS execution timeout in seconds |
| `retrieve_result_from_js_script` | boolean | ❌ | Return JS script result |
| `page_is_loaded_before_running_script` | boolean | ❌ | Wait for page load |
| `retrieve_html_from_url_after_loaded` | boolean | ❌ | Return final HTML |

### Output Format

```json
[
  {
    "url": "https://example.com",
    "result_from_js_script": { /* your JS return value */ },
    "html": "<!DOCTYPE html>..."
  }
]
```

### Checking Run Status

```javascript
const statusResponse = await fetch(
  `https://api.apify.com/v2/acts/ChNuXurElMWvpbJB9/runs/${runId}`,
  { headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }}
);
const statusData = await statusResponse.json();
console.log(statusData.data.status); // RUNNING, SUCCEEDED, FAILED
```

### Getting Results

```javascript
const resultsResponse = await fetch(
  `https://api.apify.com/v2/acts/ChNuXurElMWvpbJB9/runs/${runId}/dataset/items`,
  { headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }}
);
const results = await resultsResponse.json();
```

---

## Example Scripts

**Location:** `Research/test_cloudflare_scraper.js`

**Run test:**
```bash
node Research/test_cloudflare_scraper.js
```

**Test specific hospital:**
Edit the `TEST_HOSPITAL` object in the script.

---

## Pricing

- **Residential Proxies:** ~$0.50 per 1000 pages
- **Circle Health (49 hospitals):** ~$0.025 per full scrape
- **Monthly (weekly scrapes):** ~$0.10/month

---

## Tips

1. **Choose correct proxy country** - Use `GB` for UK websites
2. **Test on 1-2 URLs first** - Verify extraction works before batch
3. **Monitor run status** - Polls every 5 seconds, max 2.5 minutes
4. **Save results immediately** - Dataset items available after run completes
5. **Handle blocks gracefully** - Check `result_from_js_script.blocked` field

---

## Common Issues

**"BLOCKED BY CLOUDFLARE"**
- Try different `apifyProxyCountry`
- Increase `max_retries_per_url`
- Add delays between URLs

**"No results returned"**
- Check run status is `SUCCEEDED`
- Verify URL is accessible
- Check actor logs in Apify console

**"JavaScript timeout"**
- Increase `js_timeout`
- Simplify extraction script
- Check for slow-loading pages

---

## Resources

- **Apify Console:** https://console.apify.com
- **Actor Page:** https://console.apify.com/actors/ChNuXurElMWvpbJB9
- **API Docs:** https://docs.apify.com/api/v2
- **Proxy Docs:** https://docs.apify.com/proxy

---

**Last Updated:** 2025-11-01
