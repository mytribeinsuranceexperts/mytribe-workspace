# CQC (Care Quality Commission) API

## Overview

The CQC Syndication API provides access to UK healthcare facility data including hospitals, care homes, GP surgeries, and other regulated health/social care services. Data is updated daily.

**Base URL**: `https://api.service.cqc.org.uk/public/v1`

---

## Authentication

**Method**: API Key via HTTP Header

```http
Ocp-Apim-Subscription-Key: YOUR_API_KEY_HERE
```

**Getting Access**:
1. Register at https://api-portal.service.cqc.org.uk/signup
2. Retrieve your subscription key from your profile page
3. No approval process - immediate access after sign-up

**Technical Requirements**:
- TLS 1.2+ required (TLS 1.0/1.1 deprecated)
- No rate limits specified (recommend <2000 requests/min)

---

## Key Endpoints

### Locations

Get healthcare facility locations (hospitals, clinics, care homes, etc.)

```http
GET /locations
GET /locations/{locationId}
```

**Query Parameters**:
- `region` - UK region (e.g., "London", "South East")
- `inspectionDirectorate` - "Hospitals", "Adult social care", "Primary medical services"
- `page`, `perPage` - Pagination (default perPage: 100)

**Important**: Cannot filter by `type`, `registrationStatus`, or `ownershipType` in query - must filter results client-side.

### Providers

Get parent organization/provider details for locations

```http
GET /providers
GET /providers/{providerId}
```

Each location has a `providerId` field linking to its parent organization.

---

## Key Data Fields

### Location Object

```javascript
{
  "locationId": "1-109980250",
  "providerId": "1-101726253",              // Links to provider
  "name": "Hospital Name",
  "type": "Independent Healthcare Org",     // or "NHS Healthcare Organisation"
  "registrationStatus": "Registered",       // or "Deregistered"
  "deregistrationDate": null,               // Only if closed
  "numberOfBeds": 84,

  // Address
  "postalAddressLine1": "...",
  "postalCode": "...",
  "region": "London",

  // Geography
  "onspdLatitude": 51.5218972,
  "onspdLongitude": -0.1653617,
  "localAuthority": "Westminster",
  "constituency": "...",

  // Contact
  "mainPhoneNumber": "...",
  "website": "...",

  // Inspection
  "inspectionDirectorate": "Hospitals",
  "currentRatings": {
    "overall": {
      "rating": "Good",  // Outstanding, Good, Requires improvement, Inadequate
      "reportDate": "2023-02-06"
    }
  },

  // Services
  "gacServiceTypes": [...],
  "specialisms": [...],
  "careHome": "N"  // Y/N flag
}
```

### Provider Object

```javascript
{
  "providerId": "1-101726253",
  "name": "Florence Nightingale Hospitals Limited",
  "type": "Independent Healthcare Org",
  "organisationType": "Provider",
  "companiesHouseNumber": "01431836",
  "locationIds": ["1-109980250"],
  "website": "...",
  "registrationStatus": "Registered"
}
```

---

## Filtering Private Hospitals

To get **active private hospitals with beds** (excluding clinics and NHS):

**Client-Side Filters Required**:
```javascript
// Must filter after fetching data
location.type === "Independent Healthcare Org"  // Private (not NHS)
location.registrationStatus === "Registered"    // Active
location.deregistrationDate === null            // Not closed
```

**Query Parameters**:
```
?region=London
&inspectionDirectorate=Hospitals
&perPage=100
```

---

## UK Regions

Valid values for `region` parameter:

- London
- South East
- South West
- East of England
- West Midlands
- East Midlands
- Yorkshire and the Humber
- North West
- North East

---

## Example Usage

### Fetch Hospital Details

```javascript
const API_KEY = 'your_key_here';
const headers = {
  'Ocp-Apim-Subscription-Key': API_KEY,
  'Accept': 'application/json'
};

// Get specific location
const response = await fetch(
  'https://api.service.cqc.org.uk/public/v1/locations/1-109980250',
  { headers }
);
const location = await response.json();

// Get parent provider
const providerResponse = await fetch(
  `https://api.service.cqc.org.uk/public/v1/providers/${location.providerId}`,
  { headers }
);
const provider = await providerResponse.json();
```

### Filter Private Hospitals

```javascript
// Query all hospitals in region
const response = await fetch(
  'https://api.service.cqc.org.uk/public/v1/locations?region=London&inspectionDirectorate=Hospitals&perPage=100',
  { headers }
);
const data = await response.json();

// Filter for active private hospitals with beds
const privateHospitals = [];
for (const location of data.locations) {
  // Fetch full details for each
  const details = await fetch(
    `https://api.service.cqc.org.uk/public/v1/locations/${location.locationId}`,
    { headers }
  ).then(r => r.json());

  if (details.type === 'Independent Healthcare Org' &&
      details.registrationStatus === 'Registered' &&
      !details.deregistrationDate &&
      details.numberOfBeds > 0) {
    privateHospitals.push(details);
  }
}
```

---

## Data Scale

**UK-Wide** (approximate):
- **118,958** total locations (all healthcare facilities)
- **1,603** hospitals in London
- **567** active private hospitals in London
- **58** private hospitals with beds in London (rest are clinics)

**Major Private Hospital Groups**:
- HCA Healthcare UK
- Nuffield Health
- Circle Health Group
- BMI Healthcare
- Spire Healthcare
- Ramsay Health Care UK
- Aspen Healthcare

---

## Known Limitations

1. **No server-side filtering** for:
   - `type` (NHS vs private)
   - `registrationStatus` (active vs deregistered)
   - `numberOfBeds`

2. **Cannot use** `partnerCode` parameter (returns 400 error)

3. **Must fetch individual location details** to get:
   - Number of beds
   - Full address
   - Provider ID
   - Registration status

4. **Rate limiting** not documented - recommend:
   - 50ms delay between requests
   - Retry with exponential backoff on 429 errors

---

## Licensing

**Open Government Licence 3.0**

- Free to use
- Must acknowledge CQC as data source
- Cannot misrepresent official status

---

## Resources

- **API Portal**: https://api-portal.service.cqc.org.uk
- **Documentation**: https://www.cqc.org.uk/about-us/transparency/using-cqc-data
- **Support Email**: syndicationAPI@cqc.org.uk
- **CQC Website**: https://www.cqc.org.uk

---

## Scripts

See `Research/` folder for working examples:
- `fetch_private_hospitals.js` - London private hospitals
- `fetch_uk_private_hospitals_grouped.js` - All UK hospitals grouped by provider

---

**Last Updated**: 2025-11-01
