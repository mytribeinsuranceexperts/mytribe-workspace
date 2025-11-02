# CQC API Integration: Quick Compliance Summary

## Critical Requirements

| Requirement | Status | Action Required |
|------------|--------|-----------------|
| **Authentication** | REQUIRED | Register at https://api-portal.service.cqc.org.uk, get API key |
| **Rate Limits** | NOT PUBLISHED | Email syndicationAPI@cqc.org.uk to confirm values |
| **TLS Version** | TLS 1.2+ ONLY | Update HTTP clients, drop TLS 1.0/1.1 |
| **Data Attribution** | MANDATORY | Add OGL v3 + CQC source notice to UI |
| **Logo Usage** | RESTRICTED | Only if registered provider or written permission |
| **Update Frequency** | DAILY MAX | API data updates daily, don't poll faster |

---

## Rate Limits

**Known Values:** NONE PUBLISHED

**Temporary Approach (Conservative):**
- 1 request per second maximum
- Monitor 429 responses
- Implement exponential backoff

**Must Confirm With CQC:**
- Actual requests per second limit
- Daily quota (if any)
- Burst allowances
- Retry-After header usage

---

## Usage Restrictions

### Permitted
- Access provider/location data
- Store and cache data locally
- Display ratings and service information
- Commercial use (with attribution)
- Distribute derivatives (with attribution)

### Prohibited
- Claim CQC endorsement without authorization
- Use CQC logo without permission
- Misrepresent data origin
- Breach OGL v3 terms
- Use without attribution

---

## Data Available

**What You Get:**
- Provider/location names and addresses
- Registration dates (start/end)
- Organisation types
- Regulated activities
- Service types and specialisms
- Latest ratings and report dates
- Linked organisations

**What You Don't Get:**
- Email addresses (deliberately excluded)
- Phone numbers
- Direct websites (only if provider published)

---

## Technical Specifications

```
Endpoint:    https://api.service.cqc.org.uk/public/v1/
Auth:        API Key (method: Bearer token or Subscription-Key - CONFIRM)
TLS:         1.2 or higher (REQUIRED)
Encoding:    JSON
License:     Open Government Licence v3.0
Data Source: All registered providers and locations in England
```

---

## Implementation Checklist

Before going to production:

- [ ] Register on CQC API portal
- [ ] Store API credentials in environment variables (never in code)
- [ ] Update code to use https://api.service.cqc.org.uk/public/v1/
- [ ] Add TLS 1.2+ requirement to HTTP client config
- [ ] Implement authentication headers (Bearer token or Subscription-Key)
- [ ] Add OGL v3 + CQC attribution to UI/footer
- [ ] Set up daily (not hourly) scheduled API sync
- [ ] Implement 401/429 error handling
- [ ] Contact CQC to confirm rate limits
- [ ] Test end-to-end with real credentials
- [ ] Load test to confirm rate limit handling
- [ ] Review OGL v3 terms before launch

---

## Support Contact

**Email:** syndicationAPI@cqc.org.uk

**Request:** Confirm rate limits, authentication method, SLA, maintenance windows

---

## License Terms Summary

**Open Government Licence v3.0**

You can:
- Use the data commercially
- Create derivatives
- Share publicly
- Use for any purpose

You must:
- Acknowledge CQC as source
- Link to OGL v3.0 license
- Not claim false endorsement
- Follow license terms exactly

---

## Known Risks

1. **Rate limits unknown** → Contact CQC immediately
2. **Auth credentials in code** → Use environment variables only
3. **TLS version requirement** → Verify client supports 1.2+
4. **Missing attribution** → Add to footer/UI before launch
5. **Legacy URLs** → Update all references to new endpoint
6. **Logo misuse** → Only use if authorized

---

## Sample Error Responses to Expect

**Missing Authentication:**
```json
{
  "statusCode": 401,
  "message": "Access denied due to a missing application credentials or subscription key."
}
```

**Rate Limited (expected 429 if we hit limits):**
```json
{
  "statusCode": 429,
  "message": "Too many requests"
}
```

---

## Next Steps

1. **IMMEDIATE:** Register on API portal
2. **WEEK 1:** Contact CQC about rate limits + add attribution
3. **WEEK 2:** Implement auth + update endpoints
4. **WEEK 3:** Test full integration
5. **BEFORE LAUNCH:** Confirm all compliance items

---

Last Updated: 2025-11-02
Status: Research Complete - Ready for Implementation
