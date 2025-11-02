# CQC API Compliance & Rate Limit Research

## Executive Summary

Research completed: 2025-11-02

The CQC (Care Quality Commission) provides a public API for accessing healthcare provider and location data under the Open Government Licence v3. The API is available at `https://api.service.cqc.org.uk/public/v1/` and requires authentication via developer portal credentials.

---

## Key Findings

### 1. Authentication & Access

**Status:** REQUIRED
- All API requests now require authentication credentials (previously open access)
- Authentication is managed through the CQC API Portal: https://api-portal.service.cqc.org.uk
- Credentials must be obtained by registering on the developer portal
- Access denied response if credentials not included:
  ```json
  {
    "statusCode": 401,
    "message": "Access denied due to a missing application credentials or subscription key. Make sure to include an application token or a subscription key when making requests to the API."
  }
  ```

**Implication:** We must register our integration with CQC before using the API.

---

### 2. Rate Limits & Throttling

**Status:** NOT PUBLICLY DOCUMENTED (Critical Gap)

**Findings:**
- No specific rate limit values are published on the public CQC API documentation
- No documented request throttling limits (requests per second/minute/hour)
- No documented daily quota limits
- No Retry-After or X-RateLimit headers found in API responses

**Recommendation:** We must contact CQC API support to confirm rate limits before implementing production integrations.

**Contact:** syndicationAPI@cqc.org.uk

---

### 3. Data Refresh & Update Frequency

**Status:** CLEARLY DOCUMENTED

**Update Schedule:**
- **Daily:** API data is updated daily (same frequency as cqc.org.uk website)
- **Weekly:** Pre-prepared CSV data sheets updated weekly
- **Monthly:** Care directory with ratings spreadsheet updated monthly

**Implication:** Our integration should not poll more frequently than daily to avoid unnecessary load. Implement daily scheduled updates using cron/scheduled tasks.

---

### 4. Data Usage License & Attribution

**Status:** OPEN GOVERNMENT LICENCE v3 (Published)

**License Details:**
- Data is released under **Open Government Licence (OGL) v3.0**
- Link: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

**Attribution Requirement:**
- Users must acknowledge use of CQC data on their site/service
- No CQC logo usage without written permission (except registered providers displaying ratings)
- Logo infringement constitutes trademark violation

**Mandatory Acknowledgment Language:**
Sites must include a statement like:
```
"This data includes information licensed under the Open Government Licence v3.0.
Source: Care Quality Commission (CQC)"
```

**Commercial Use:** Permitted under OGL v3 (with attribution)

---

### 5. Technical Requirements

**TLS/SSL Requirement:** ENFORCED
- **Minimum:** TLS 1.2 or higher
- API no longer supports TLS 1.0 or TLS 1.1
- **Action Required:** Verify our HTTP client uses TLS 1.2+

**API Endpoint Structure:**
```
https://api.service.cqc.org.uk/public/v1/
```

**Important:** Do NOT use legacy endpoints starting with different base URLs.

---

### 6. API Data Availability

**Available Through API:**

Provider/Location Data:
- Names and addresses
- Registration dates (start and end)
- Organisation type (NHS healthcare, social care, etc.)
- Linked organisations
- Regulated activities
- Service types and specialisms (locations)
- Latest ratings and report publication dates

**NOT Available in Standard Format:**
- Email addresses (deliberately excluded)
- Contact numbers (not included)
- Websites (included as links where provider has published them)

---

### 7. Data Handling & Storage Requirements

**Storage & Retention:**
- No explicit minimum retention period documented
- Data can be cached/stored by API consumers
- Updates should reflect daily changes from the API

**Data Protection:**
- CQC data is public sector information
- No GDPR/GDSS specific restrictions beyond standard data protection
- No explicit data anonymization requirements

**Prohibited Uses (Inferred from OGL v3):**
- Cannot claim endorsement by CQC without permission
- Cannot use CQC logo without authorization
- Cannot misrepresent data origin
- Cannot breach OGL v3 conditions

---

### 8. Provider Registration & Feedback

**Registration Portal:**
- https://api-portal.service.cqc.org.uk
- Must register to obtain API credentials
- Authentication helps CQC understand usage patterns
- CQC can notify users of future API changes

**Support & Feedback:**
- Email: syndicationAPI@cqc.org.uk
- Email: syndicationapi@cqc.org.uk?subject=CQC%20API (feedback)

---

### 9. Known API Changes (Recent)

**Recent Migration (Current):**
- API base URL changed to https://api.service.cqc.org.uk
- Authentication now required (previously optional)
- New single assessment framework support added
- TLS 1.0/1.1 no longer supported

**Impact:** Existing integrations using legacy URLs or without authentication will fail.

---

## Compliance Checklist

- [ ] **Authentication:** Register on CQC API portal before production use
- [ ] **TLS:** Verify minimum TLS 1.2 in all HTTP clients
- [ ] **Attribution:** Add CQC data source acknowledgment to UI
- [ ] **Rate Limits:** Contact syndicationAPI@cqc.org.uk to confirm limits
- [ ] **Update Frequency:** Implement daily (not more) refresh schedule
- [ ] **Logo Usage:** Only use CQC logo if permitted (registered provider display)
- [ ] **Data Retention:** Document data caching strategy and refresh intervals
- [ ] **Error Handling:** Gracefully handle 401 auth errors and rate limit responses
- [ ] **Monitoring:** Log API usage to track against undocumented limits
- [ ] **Terms Agreement:** Review full OGL v3 before deploying

---

## Compliance Risks & Mitigations

### Risk 1: Unknown Rate Limits
**Risk:** API rate limits not published; could face service disruption
**Mitigation:**
- Contact CQC before production deployment
- Implement exponential backoff for rate limit errors
- Monitor 429 responses and adjust request frequency

### Risk 2: Authentication Credentials Exposure
**Risk:** API credentials in code could be compromised
**Mitigation:**
- Store credentials in environment variables (never in code)
- Use secure secret management (e.g., AWS Secrets Manager, Bitwarden)
- Rotate credentials regularly
- Never log or expose credentials in error messages

### Risk 3: Daily Data Changes Missed
**Risk:** Infrequent updates could miss day-to-day changes
**Mitigation:**
- Implement daily scheduled tasks (e.g., cron at 02:00 GMT daily)
- Log update timestamps to verify successful daily syncs
- Alert if update fails for >24 hours

### Risk 4: Logo/Attribution Misuse
**Risk:** Unauthorized logo use or missing attribution = trademark infringement
**Mitigation:**
- Display attribution statement on every page using CQC data
- Never use CQC logo except if explicitly authorized
- Include OGL v3 license footer link

### Risk 5: Legacy URL References
**Risk:** Old API URLs will fail with 401
**Mitigation:**
- Audit all code/config for legacy CQC API URLs
- Update to https://api.service.cqc.org.uk/public/v1/
- Test all endpoints after migration

---

## Implementation Recommendations

### 1. Authentication Flow

```python
# Example (pseudocode)
API_BASE_URL = "https://api.service.cqc.org.uk/public/v1"
API_KEY = os.getenv("CQC_API_KEY")  # Store in .env
API_SECRET = os.getenv("CQC_API_SECRET")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    # OR use subscription key header if required by CQC
    "Subscription-Key": API_KEY
}

response = requests.get(f"{API_BASE_URL}/providers", headers=headers)
```

### 2. Rate Limiting Strategy (Until Confirmed)

```python
# Conservative approach - 1 request per second
import time
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=1, period=1)
def api_request(endpoint):
    return requests.get(f"{API_BASE_URL}/{endpoint}")
```

### 3. Scheduled Updates

```python
# Daily sync - 02:00 GMT (off-peak)
# Using APScheduler or similar
scheduler.add_job(
    func=sync_cqc_data,
    trigger="cron",
    hour=2,
    minute=0,
    timezone="UTC"
)
```

### 4. Attribution Display

```html
<!-- Add to footer or data source section -->
<div class="data-attribution">
    <p>Contains information licensed under the
    <a href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">
    Open Government Licence v3.0</a>.
    Source: <a href="https://www.cqc.org.uk">Care Quality Commission</a></p>
</div>
```

### 5. Error Handling

```python
import requests
from requests.exceptions import RequestException

def call_cqc_api(endpoint, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(
                f"{API_BASE_URL}/{endpoint}",
                headers=headers,
                timeout=10
            )

            # Check for rate limiting
            if response.status_code == 429:
                wait_time = int(response.headers.get('Retry-After', 60))
                time.sleep(wait_time)
                continue

            # Check for auth failure
            if response.status_code == 401:
                raise Exception("CQC API authentication failed - check credentials")

            response.raise_for_status()
            return response.json()

        except RequestException as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
            else:
                raise
```

---

## Action Items for Integration Team

1. **Immediate (Before Any Production Work)**
   - Register on https://api-portal.service.cqc.org.uk
   - Obtain API credentials (Key/Secret or Bearer token)
   - Contact syndicationAPI@cqc.org.uk to confirm:
     - Rate limit values
     - Authentication method (Bearer token vs Subscription-Key)
     - SLA/uptime guarantees
     - Maintenance windows

2. **Short-term (Week 1)**
   - Add CQC data source attribution to UI
   - Verify TLS 1.2+ in all HTTP clients
   - Update API endpoints to https://api.service.cqc.org.uk/public/v1/
   - Implement authentication header logic

3. **Medium-term (Week 2-3)**
   - Set up daily scheduled API sync
   - Implement rate limiting (conservative: 1 req/sec until confirmed)
   - Add comprehensive error logging
   - Test full end-to-end integration

4. **Before Production Deployment**
   - Load test against actual rate limits
   - Verify 401/429 error handling
   - Document any CQC credential rotation procedures
   - Confirm attribution displays correctly
   - Run security audit on credential storage

---

## Reference Links

- **CQC API Data Page:** https://www.cqc.org.uk/about-us/transparency/using-cqc-data
- **API Portal (Registration):** https://api-portal.service.cqc.org.uk
- **Open Government Licence v3:** http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
- **CQC Terms & Conditions:** https://www.cqc.org.uk/about-us/our-policies/terms-conditions
- **CQC Support:** syndicationAPI@cqc.org.uk
- **API Base URL:** https://api.service.cqc.org.uk/public/v1/

---

## Research Gaps & Next Steps

**Information NOT Found (Requires Direct Contact):**
1. Specific rate limit values (requests/second or daily quota)
2. SLA/uptime guarantees
3. Scheduled maintenance windows
4. API versioning/deprecation policy
5. Maximum response payload size
6. Pagination limits
7. Data retention policy for deletions/updates

**Recommended Follow-up Email to CQC:**

```
Subject: CQC API Rate Limits & Technical Requirements - Integration Planning

Hi CQC API Team,

We're integrating the CQC API into our healthcare provider comparison platform
and need clarification on the following items to ensure compliance:

1. What are the specific rate limits (requests per second/minute/hour/day)?
2. Are there any daily quota limits we should be aware of?
3. Should we use Bearer token or Subscription-Key authentication?
4. Do you have an SLA or uptime guarantee?
5. Are there scheduled maintenance windows?
6. What is the maximum recommended page size for list endpoints?
7. How should we handle 429 rate limit responses?

We will display appropriate attribution to CQC data and comply with the Open
Government Licence v3.0.

Thank you,
[Your Team]
```

---

**Document Status:** Research Complete - Action Items Ready
**Last Updated:** 2025-11-02
**Prepared For:** myTribe Integration Team
