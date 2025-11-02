# CQC API - Available Fields Analysis

**Date:** 2025-11-02
**Purpose:** Complete field mapping for comprehensive database design

---

## Summary

- **Currently Captured:** 22 fields (in v2 extraction)
- **Available from API:** 38+ fields
- **Missing/Not Stored:** 19 fields

---

## Field Comparison

### ✅ Fields We Currently Capture (22)

| Field | Source | Notes |
|-------|--------|-------|
| `locationId` | Location API | ✅ Primary key |
| `providerId` | Location API | ✅ Foreign key to provider |
| `name` | Location API | ✅ Facility name |
| `postalAddressLine1` | Location API | ✅ Address |
| `postalAddressLine2` | Location API | ✅ Address (often null) |
| `postalAddressTownCity` | Location API | ✅ Town/city |
| `postalAddressCounty` | Location API | ⚠️ Often null (~18% missing) |
| `postalCode` | Location API | ✅ Postcode |
| `region` | Location API | ✅ UK region |
| `localAuthority` | Location API | ✅ Local authority |
| `constituency` | Location API | ✅ Parliamentary constituency |
| `onspdLatitude` | Location API | ✅ Coordinates |
| `onspdLongitude` | Location API | ✅ Coordinates |
| `mainPhoneNumber` | Location Details | ⚠️ Requires separate API call |
| `website` | Location Details / Provider | ⚠️ Sometimes from provider |
| `numberOfBeds` | Location API | ✅ Bed count |
| `registrationDate` | Location API | ✅ Registration date |
| `currentRatings.overall.rating` | Location Details | ⚠️ Requires separate call |
| `currentRatings.overall.reportDate` | Location Details | ⚠️ Requires separate call |
| `gacServiceTypes[]` | Location API | ✅ Array of services |
| `specialisms[]` | Location API | ✅ Array of specialisms |
| `companiesHouseNumber` | Provider API | ⚠️ Requires provider API call |

### ❌ Fields We're MISSING (19 - High Value)

| Field | Description | Value |
|-------|-------------|-------|
| **Core Classification** |||
| `type` | "Independent Healthcare Org" or "NHS Healthcare Organisation" | **HIGH** - Essential filter |
| `organisationType` | Always "Location" | LOW - constant value |
| `registrationStatus` | "Registered" or "Deregistered" | **HIGH** - Essential filter |
| `inspectionDirectorate` | "Hospitals", "Adult social care", etc. | **MEDIUM** - Useful grouping |
| `careHome` | "Y" or "N" | **MEDIUM** - Care home flag |
| **NHS Integration** |||
| `onspdCcgCode` | Clinical Commissioning Group code | **MEDIUM** - NHS mapping |
| `onspdCcgName` | Clinical Commissioning Group name | **MEDIUM** - NHS mapping |
| `onspdIcbCode` | Integrated Care Board code | **MEDIUM** - NHS structure |
| `onspdIcbName` | Integrated Care Board name | **MEDIUM** - NHS structure |
| **Operational Status** |||
| `dormancy` | "Y" or "N" - Temporarily inactive | **HIGH** - Important status |
| `dormancyEndDate` | When dormancy ends | **MEDIUM** - Resume date |
| `deregistrationDate` | When facility deregistered | **HIGH** - For inactive tracking |
| **Property & Relationships** |||
| `uprn` | Unique Property Reference Number | **MEDIUM** - UK property system |
| `relationships[]` | Related locations/providers | **MEDIUM** - Corporate structure |
| `locationTypes[]` | Additional classifications | LOW - rarely populated |
| **Inspection Details** |||
| `regulatedActivities[]` | Activities + registered manager contacts | **HIGH** - Key personnel info |
| `inspectionCategories[]` | Category codes + names | **MEDIUM** - Classification |
| `inspectionAreas[]` | Inspection-specific data | LOW - rarely populated |

### 📊 Additional Provider Fields (from Provider API)

| Field | Description | Value |
|-------|-------------|-------|
| `name` | Provider name | ✅ Already captured |
| `companiesHouseNumber` | Companies House registration | ✅ Already captured |
| `website` | Provider website | ✅ Already captured |
| `type` | "Organisation" | LOW - constant |
| `registrationStatus` | Provider status | MEDIUM |
| `registrationDate` | Provider reg date | MEDIUM |
| `postalAddress*` | Provider HQ address | MEDIUM |
| `mainPhoneNumber` | Provider phone | LOW - have location phone |
| `organisationSubtype` | e.g., "Partnership" | LOW |
| `inspectionDirectorate` | Provider directorate | LOW |
| `relationships[]` | Parent/subsidiary links | MEDIUM |

---

## Recommended Database Schema Updates

### Option 1: Store ALL Fields (Comprehensive)

```sql
CREATE TABLE cqc_facilities (
    -- ... existing fields ...

    -- NEW: Core classification
    type VARCHAR(100) NOT NULL,  -- "Independent Healthcare Org" / "NHS Healthcare Organisation"
    organisation_type VARCHAR(50),  -- Always "Location"
    registration_status VARCHAR(50) NOT NULL,  -- "Registered" / "Deregistered"
    inspection_directorate VARCHAR(100),  -- "Hospitals", "Adult social care"
    care_home BOOLEAN DEFAULT FALSE,  -- Y/N -> boolean

    -- NEW: NHS integration
    ccg_code VARCHAR(20),
    ccg_name VARCHAR(255),
    icb_code VARCHAR(20),
    icb_name VARCHAR(255),

    -- NEW: Operational status
    is_dormant BOOLEAN DEFAULT FALSE,  -- Y/N -> boolean
    dormancy_end_date DATE,
    deregistration_date DATE,

    -- NEW: Property reference
    uprn VARCHAR(20),  -- Unique Property Reference Number

    -- NEW: Inspection categories (JSONB)
    inspection_categories JSONB DEFAULT '[]'::JSONB,  -- [{"code": "H4", "name": "...", "primary": true}]

    -- NEW: Regulated activities (JSONB) - includes contacts
    regulated_activities JSONB DEFAULT '[]'::JSONB,  -- [{"name": "...", "code": "RA8", "contacts": [...]}]

    -- NEW: Relationships (JSONB)
    relationships JSONB DEFAULT '[]'::JSONB,  -- Related locations/providers

    -- ... rest of existing fields ...
);
```

### Option 2: Store Key Fields + Raw JSON (Pragmatic - RECOMMENDED)

```sql
CREATE TABLE cqc_facilities (
    -- Core fields (existing + new essentials)
    id BIGSERIAL PRIMARY KEY,
    cqc_location_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,

    -- Provider
    provider_id BIGINT REFERENCES cqc_providers(id),
    provider_name VARCHAR(255) NOT NULL,

    -- NEW: Core classification (essential filters)
    type VARCHAR(100) NOT NULL,  -- "Independent Healthcare Org" / "NHS"
    registration_status VARCHAR(50) NOT NULL,  -- "Registered" / "Deregistered"
    inspection_directorate VARCHAR(100),  -- "Hospitals", "Adult social care"
    care_home BOOLEAN DEFAULT FALSE,

    -- NEW: Operational status (important)
    is_dormant BOOLEAN DEFAULT FALSE,
    dormancy_end_date DATE,
    deregistration_date DATE,

    -- Location (existing)
    region VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    town_city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),

    -- NEW: Property reference (useful for mapping)
    uprn VARCHAR(20),

    -- NEW: NHS integration (useful for future NHS comparison)
    ccg_code VARCHAR(20),
    ccg_name VARCHAR(255),
    icb_code VARCHAR(20),
    icb_name VARCHAR(255),

    -- Contact (existing)
    phone VARCHAR(50),
    website VARCHAR(500),

    -- Details (existing)
    number_of_beds INTEGER,
    registration_date DATE,
    rating VARCHAR(50),
    rating_date DATE,

    -- Flexible metadata (existing + expanded)
    services JSONB DEFAULT '[]'::JSONB,
    specialisms JSONB DEFAULT '[]'::JSONB,

    -- NEW: Complete raw CQC response (future-proof)
    cqc_raw_data JSONB DEFAULT '{}'::JSONB,  -- Store EVERYTHING from API

    -- Sync tracking (existing)
    cqc_last_updated TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Benefits of Option 2:**
- ✅ Store essential fields as columns (fast queries, good indexes)
- ✅ Store ALL other data in `cqc_raw_data` JSONB (complete record)
- ✅ No data loss
- ✅ Easy to promote JSONB fields to columns later if needed
- ✅ Future-proof against CQC API changes

---

## Key Findings

### High-Value Missing Fields (Should Add)

1. **`type`** - Essential filter (Independent vs NHS)
2. **`registrationStatus`** - Essential filter (Registered vs Deregistered)
3. **`is_dormant` + `dormancyEndDate`** - Temporarily inactive facilities
4. **`deregistrationDate`** - When facility closed
5. **`regulatedActivities`** - Includes registered manager contact info
6. **NHS fields (`ccg_code`, `icb_code`)** - Useful for NHS comparison research

### Medium-Value Fields (Nice to Have)

1. **`inspectionDirectorate`** - Better categorization
2. **`care_home`** - Flag care homes vs hospitals
3. **`uprn`** - UK property system integration
4. **`inspectionCategories`** - Additional classification

### Low-Value Fields (Can Skip)

1. **`organisationType`** - Always "Location"
2. **`locationTypes`** - Rarely populated
3. **`inspectionAreas`** - Rarely populated
4. **`relationships`** - Complex, rare use case

---

## Recommendation

**Use Option 2 (Pragmatic Approach):**

1. **Store key fields as columns:**
   - `type`, `registration_status`, `inspection_directorate`
   - `care_home`, `is_dormant`, `deregistration_date`
   - NHS fields (`ccg_code`, `ccg_name`, `icb_code`, `icb_name`)
   - `uprn`

2. **Store complete API response in `cqc_raw_data` JSONB:**
   - `regulatedActivities` (includes manager contacts)
   - `inspectionCategories`
   - `relationships`
   - Any future fields CQC adds

3. **Benefits:**
   - Fast queries on essential fields
   - No data loss (everything in JSONB)
   - Easy to query JSONB when needed: `cqc_raw_data->>'field'`
   - Future-proof against API changes

---

## Sample Query Using New Fields

```sql
-- Find all active private hospitals (not care homes, not dormant)
SELECT
    name,
    town_city,
    region,
    number_of_beds,
    rating,
    is_dormant,
    care_home
FROM cqc_facilities
WHERE is_active = TRUE
  AND type = 'Independent Healthcare Org'
  AND registration_status = 'Registered'
  AND deregistration_date IS NULL
  AND is_dormant = FALSE
  AND care_home = FALSE
  AND inspection_directorate = 'Hospitals'
ORDER BY region, name;
```

```sql
-- Find facilities with registered managers (from regulatedActivities JSONB)
SELECT
    name,
    town_city,
    cqc_raw_data->'regulatedActivities'
FROM cqc_facilities
WHERE cqc_raw_data->'regulatedActivities' IS NOT NULL
  AND jsonb_array_length(cqc_raw_data->'regulatedActivities') > 0
LIMIT 10;
```

```sql
-- NHS vs Private breakdown by region
SELECT
    region,
    COUNT(*) FILTER (WHERE type = 'NHS Healthcare Organisation') as nhs_count,
    COUNT(*) FILTER (WHERE type = 'Independent Healthcare Org') as private_count,
    COUNT(*) as total
FROM cqc_facilities
WHERE is_active = TRUE
  AND registration_status = 'Registered'
GROUP BY region
ORDER BY total DESC;
```

---

## Next Steps

1. **Update database schema** to include new fields (Option 2 recommended)
2. **Update extraction script** to capture ALL fields
3. **Update Edge Function** to sync new fields weekly
4. **Test queries** using new classification fields
5. **Consider** adding RLS policies if sensitive data (manager contacts)

---

**Created:** 2025-11-02
**Status:** Ready for schema update
