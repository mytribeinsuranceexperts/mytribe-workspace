# CQC Regulated Activities - Data Extraction & Transformation Design

## Overview

**Current State:**
- Regulated activities are stored as TEXT[] array of activity names only
- Activity codes (RA1-RA16) are discarded
- Contact information (managers per activity) is lost
- No relationship tracking between locations and activities

**Target State:**
- Full extraction of activity codes, names, and contacts
- Preserve many-to-many relationship (location ↔ activities)
- Enable queries like "Find all locations offering RA5" or "Who manages RA7 at this location?"
- Maintain complete audit trail via `cqc_raw_data` JSONB

---

## Data Structure Analysis

### CQC API Response Structure

```json
{
  "locationId": "1-10000302982",
  "name": "Henley House",
  "regulatedActivities": [
    {
      "name": "Accommodation for persons who require nursing or personal care",
      "code": "RA2",
      "contacts": [
        {
          "personTitle": "Ms",
          "personGivenName": "Rebecca Jane",
          "personFamilyName": "Bewley",
          "personRoles": ["Registered Manager"]
        }
      ]
    }
  ]
}
```

### Key Fields to Extract

| Field | Type | Example | Required | Notes |
|-------|------|---------|----------|-------|
| `code` | String | "RA2" | ✅ Yes | Activity code (RA1-RA16) |
| `name` | String | "Treatment of disease..." | ✅ Yes | Activity name |
| `contacts` | Array | `[{personTitle, ...}]` | ❌ No | May be empty array |
| `contacts[].personTitle` | String | "Mr", "Ms", "Dr" | ❌ No | Title |
| `contacts[].personGivenName` | String | "Jagjivan Lalji" | ❌ No | First name |
| `contacts[].personFamilyName` | String | "Vara" | ❌ No | Last name |
| `contacts[].personRoles` | Array | `["Registered Manager"]` | ❌ No | Roles |

---

## Database Schema Recommendations

### Option 1: JSONB Column (Simple, Current Approach)

**Advantages:**
- No schema changes required
- Fast to implement
- Flexible for future CQC API changes
- Complete data preservation

**Disadvantages:**
- Harder to query (need JSONB operators)
- No relational integrity
- No indexed lookups by activity code

**Implementation:**
```python
# Store as JSONB in cqc_facilities table
"regulated_activities_detailed": [
    {
        "code": "RA2",
        "name": "Accommodation for persons...",
        "contacts": [
            {
                "title": "Ms",
                "given_name": "Rebecca Jane",
                "family_name": "Bewley",
                "roles": ["Registered Manager"]
            }
        ]
    }
]
```

**SQL Queries:**
```sql
-- Find all locations offering RA5
SELECT location_id, name
FROM cqc_facilities
WHERE regulated_activities_detailed @> '[{"code": "RA5"}]'::jsonb;

-- Find locations with registered managers
SELECT location_id, name,
  jsonb_path_query(regulated_activities_detailed, '$[*].contacts[*].roles[*]')
FROM cqc_facilities
WHERE regulated_activities_detailed @@ '$.contacts[*].roles[*] == "Registered Manager"';
```

---

### Option 2: Junction Table (Normalized, Relational)

**Advantages:**
- Proper relational design
- Fast indexed queries
- Referential integrity
- Easy joins and aggregations

**Disadvantages:**
- Requires new tables
- More complex upsert logic
- Duplicate data (name stored in multiple places)

**Schema:**

```sql
-- Reference table (could be static seed data)
CREATE TABLE cqc_regulated_activity_types (
    code VARCHAR(10) PRIMARY KEY,  -- RA1-RA16
    name TEXT NOT NULL,
    description TEXT
);

-- Junction table
CREATE TABLE cqc_location_regulated_activities (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL REFERENCES cqc_facilities(location_id) ON DELETE CASCADE,
    activity_code VARCHAR(10) NOT NULL REFERENCES cqc_regulated_activity_types(code),
    contacts JSONB,  -- Store contact array as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(location_id, activity_code)  -- Prevent duplicates
);

CREATE INDEX idx_location_activities_location ON cqc_location_regulated_activities(location_id);
CREATE INDEX idx_location_activities_code ON cqc_location_regulated_activities(activity_code);
```

**SQL Queries:**
```sql
-- Find all locations offering RA5
SELECT f.location_id, f.name, f.postal_address
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
WHERE lra.activity_code = 'RA5';

-- Count facilities per activity
SELECT activity_code, rat.name, COUNT(*) as facility_count
FROM cqc_location_regulated_activities lra
JOIN cqc_regulated_activity_types rat ON lra.activity_code = rat.code
GROUP BY activity_code, rat.name
ORDER BY facility_count DESC;

-- Find registered managers for a location
SELECT location_id, activity_code,
  jsonb_array_elements(contacts) ->> 'given_name' as manager_name
FROM cqc_location_regulated_activities
WHERE location_id = '1-10000302982'
  AND contacts @> '[{"roles": ["Registered Manager"]}]'::jsonb;
```

---

### Option 3: Hybrid (Recommended)

**Keep both:**
1. JSONB in `cqc_facilities.regulated_activities_detailed` (audit trail, complete data)
2. Junction table `cqc_location_regulated_activities` (fast queries, relationships)

**Benefits:**
- Complete data preservation (JSONB)
- Fast relational queries (junction table)
- Best of both worlds

---

## Python Transformation Function

### Enhanced Extraction (Pseudo-code)

```python
def transform_regulated_activities(location: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract regulated activities with codes and contacts.

    Returns:
        {
            "activities_simple": ["Activity 1", "Activity 2"],  # TEXT[] for backward compat
            "activities_detailed": [                            # JSONB for new schema
                {
                    "code": "RA2",
                    "name": "Accommodation for persons...",
                    "contacts": [
                        {
                            "title": "Ms",
                            "given_name": "Rebecca",
                            "family_name": "Bewley",
                            "roles": ["Registered Manager"]
                        }
                    ]
                }
            ]
        }
    """
    activities_raw = location.get("regulatedActivities", [])

    # Simple list (backward compatibility)
    activities_simple = []

    # Detailed list (full extraction)
    activities_detailed = []

    for activity in activities_raw:
        if not isinstance(activity, dict):
            continue

        # Extract basic fields
        code = activity.get("code")
        name = activity.get("name")

        # Skip if missing required fields
        if not code or not name:
            continue

        # Add to simple list
        activities_simple.append(name)

        # Extract contacts
        contacts_raw = activity.get("contacts", [])
        contacts_processed = []

        for contact in contacts_raw:
            if not isinstance(contact, dict):
                continue

            contact_data = {
                "title": contact.get("personTitle"),
                "given_name": contact.get("personGivenName"),
                "family_name": contact.get("personFamilyName"),
                "roles": contact.get("personRoles", [])
            }

            # Only include if at least one field is present
            if any(contact_data.values()):
                contacts_processed.append(contact_data)

        # Add to detailed list
        activities_detailed.append({
            "code": code,
            "name": name,
            "contacts": contacts_processed if contacts_processed else []
        })

    return {
        "activities_simple": activities_simple if activities_simple else None,
        "activities_detailed": activities_detailed if activities_detailed else None
    }
```

### Updated `transform_facility_data()` Function

```python
def transform_facility_data(location: Dict[str, Any]) -> Dict[str, Any]:
    """Transform CQC location data to Supabase format."""

    # Extract postal address components
    postal_address = {
        "address_line_1": location.get("postalAddressLine1"),
        "address_line_2": location.get("postalAddressLine2"),
        "town_city": location.get("postalAddressTownCity"),
        "county": location.get("postalAddressCounty"),
        "postal_code": location.get("postalCode")
    }

    # Extract services
    services_raw = location.get("gacServiceTypes", [])
    services = [
        s.get("name") for s in services_raw
        if isinstance(s, dict) and s.get("name")
    ]

    # Extract specialisms
    specialisms = location.get("specialisms", [])

    # ENHANCED: Extract regulated activities with full detail
    activities_data = transform_regulated_activities(location)

    # Extract rating
    ratings = location.get("currentRatings", {})
    overall_rating = None
    if isinstance(ratings, dict) and "overall" in ratings:
        overall_rating = ratings["overall"].get("rating")

    # Extract primary inspection category
    primary_category_code = None
    primary_category_name = None
    inspection_categories = location.get("inspectionCategories", [])
    for cat in inspection_categories:
        if isinstance(cat, dict) and cat.get("primary") == "true":
            primary_category_code = cat.get("code")
            primary_category_name = cat.get("name")
            break

    return {
        "location_id": location.get("locationId"),
        "provider_id": location.get("providerId"),
        "name": location.get("name"),
        "also_known_as": location.get("alsoKnownAs"),
        "postal_address": postal_address,
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "services": services if services else None,
        "specialisms": specialisms if specialisms else None,

        # BACKWARD COMPATIBLE: Keep old field
        "regulated_activities": activities_data.get("activities_simple"),

        # NEW: Full detail extraction
        "regulated_activities_detailed": activities_data.get("activities_detailed"),

        "registration_status": location.get("registrationStatus"),
        "registration_date": location.get("registrationDate"),
        "overall_rating": overall_rating,
        "inspection_directorate": location.get("inspectionDirectorate"),
        "phone": location.get("mainPhoneNumber"),
        "website": location.get("website"),
        "last_inspection_date": location.get("lastInspection", {}).get("date")
            if isinstance(location.get("lastInspection"), dict) else None,
        "report_publication_date": location.get("reportPublicationDate"),
        "bed_count": location.get("numberOfBeds"),
        "primary_inspection_category_code": primary_category_code,
        "primary_inspection_category_name": primary_category_name,

        # Store complete CQC API response for true mirroring
        "cqc_raw_data": location
    }
```

---

## Upsert Strategy

### Option A: Single Table (JSONB Approach)

```python
async def upsert_facility_with_activities(
    supabase: Client,
    facility_data: Dict[str, Any]
) -> None:
    """
    Upsert facility with regulated activities in single operation.

    Uses Supabase upsert with on_conflict on location_id.
    """
    try:
        result = supabase.table("cqc_facilities").upsert(
            facility_data,
            on_conflict="location_id"
        ).execute()

        return result

    except Exception as e:
        print(f"Error upserting facility {facility_data.get('location_id')}: {e}")
        raise
```

**Advantages:**
- Single database operation
- Atomic update
- No orphaned records

**Disadvantages:**
- Can't query activities efficiently
- Full row update on every sync

---

### Option B: Junction Table Approach

```python
async def upsert_facility_with_junction(
    supabase: Client,
    facility_data: Dict[str, Any]
) -> None:
    """
    Upsert facility and regulated activities using junction table.

    Process:
    1. Upsert main facility record
    2. Delete existing activity relationships
    3. Insert new activity relationships
    """
    location_id = facility_data.get("location_id")
    activities_detailed = facility_data.get("regulated_activities_detailed", [])

    try:
        # Step 1: Upsert main facility
        supabase.table("cqc_facilities").upsert(
            facility_data,
            on_conflict="location_id"
        ).execute()

        # Step 2: Delete existing activity relationships
        supabase.table("cqc_location_regulated_activities").delete().eq(
            "location_id", location_id
        ).execute()

        # Step 3: Insert new activity relationships
        if activities_detailed:
            activity_rows = [
                {
                    "location_id": location_id,
                    "activity_code": activity["code"],
                    "contacts": activity.get("contacts", [])
                }
                for activity in activities_detailed
            ]

            supabase.table("cqc_location_regulated_activities").insert(
                activity_rows
            ).execute()

    except Exception as e:
        print(f"Error upserting facility with junction: {e}")
        raise
```

**Advantages:**
- Proper relational design
- Efficient queries
- No data duplication

**Disadvantages:**
- Three database operations
- Not atomic (needs transaction)
- More complex error handling

---

### Option C: Batch Junction Table Upsert (Recommended)

```python
async def batch_upsert_facilities_and_activities(
    supabase: Client,
    facilities: List[Dict[str, Any]]
) -> Dict[str, int]:
    """
    Batch upsert facilities and activities for performance.

    Returns:
        Statistics dict with counts
    """
    stats = {
        "facilities_upserted": 0,
        "activities_inserted": 0,
        "errors": 0
    }

    # Batch size for Supabase (avoid hitting payload limits)
    BATCH_SIZE = 100

    try:
        # Step 1: Batch upsert facilities
        for i in range(0, len(facilities), BATCH_SIZE):
            batch = facilities[i:i + BATCH_SIZE]

            supabase.table("cqc_facilities").upsert(
                batch,
                on_conflict="location_id"
            ).execute()

            stats["facilities_upserted"] += len(batch)

        # Step 2: Collect all activity rows
        all_activity_rows = []
        location_ids = []

        for facility in facilities:
            location_id = facility.get("location_id")
            location_ids.append(location_id)

            activities = facility.get("regulated_activities_detailed", [])
            for activity in activities:
                all_activity_rows.append({
                    "location_id": location_id,
                    "activity_code": activity["code"],
                    "contacts": activity.get("contacts", [])
                })

        # Step 3: Delete old activities for all locations
        if location_ids:
            supabase.table("cqc_location_regulated_activities").delete().in_(
                "location_id", location_ids
            ).execute()

        # Step 4: Batch insert new activities
        for i in range(0, len(all_activity_rows), BATCH_SIZE):
            batch = all_activity_rows[i:i + BATCH_SIZE]

            supabase.table("cqc_location_regulated_activities").insert(
                batch
            ).execute()

            stats["activities_inserted"] += len(batch)

        return stats

    except Exception as e:
        stats["errors"] += 1
        print(f"Batch upsert error: {e}")
        raise
```

**Advantages:**
- Reduces database round-trips
- Better for large syncs (900+ locations)
- Respects rate limits

**Disadvantages:**
- More memory usage
- Bulk delete/insert (may cause brief inconsistency)

---

## Error Handling Strategy

### Data Validation Errors

```python
def validate_regulated_activity(activity: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Validate a single regulated activity entry.

    Returns:
        (is_valid, list_of_errors)
    """
    errors = []

    # Required: code
    code = activity.get("code")
    if not code:
        errors.append("Missing activity code")
    elif not code.startswith("RA"):
        errors.append(f"Invalid activity code format: {code}")

    # Required: name
    name = activity.get("name")
    if not name:
        errors.append("Missing activity name")

    # Optional: contacts validation
    contacts = activity.get("contacts", [])
    if contacts and not isinstance(contacts, list):
        errors.append("Contacts must be an array")

    for contact in contacts:
        if not isinstance(contact, dict):
            errors.append("Invalid contact format")
            continue

        roles = contact.get("personRoles", [])
        if roles and not isinstance(roles, list):
            errors.append("personRoles must be an array")

    return (len(errors) == 0, errors)


def transform_regulated_activities_safe(location: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract regulated activities with validation and error handling.
    """
    activities_raw = location.get("regulatedActivities", [])

    activities_simple = []
    activities_detailed = []
    errors = []

    for idx, activity in enumerate(activities_raw):
        if not isinstance(activity, dict):
            errors.append(f"Activity {idx}: Not a dictionary")
            continue

        # Validate
        is_valid, validation_errors = validate_regulated_activity(activity)

        if not is_valid:
            errors.append(f"Activity {idx}: {', '.join(validation_errors)}")
            # Skip invalid activities
            continue

        # Extract (same as before)
        code = activity.get("code")
        name = activity.get("name")
        activities_simple.append(name)

        contacts_processed = []
        for contact in activity.get("contacts", []):
            if isinstance(contact, dict):
                contacts_processed.append({
                    "title": contact.get("personTitle"),
                    "given_name": contact.get("personGivenName"),
                    "family_name": contact.get("personFamilyName"),
                    "roles": contact.get("personRoles", [])
                })

        activities_detailed.append({
            "code": code,
            "name": name,
            "contacts": contacts_processed
        })

    # Log errors if any
    if errors:
        location_id = location.get("locationId", "unknown")
        print(f"WARN: Errors extracting activities for {location_id}:")
        for error in errors:
            print(f"  - {error}")

    return {
        "activities_simple": activities_simple if activities_simple else None,
        "activities_detailed": activities_detailed if activities_detailed else None,
        "extraction_errors": errors if errors else None
    }
```

---

## Performance Considerations

### Rate Limiting Impact

**Current Setup:**
- Rate limit: 100 req/min (0.6 sec per call)
- Test: 900 locations
- API calls: 900 (list) + 900 (details) = 1,800 calls
- Time: ~18 minutes

**With Junction Table:**
- No impact on API calls (same data fetched)
- Database operations increase:
  - Old: 900 upserts
  - New: 900 upserts + ~2,700 activity inserts (avg 3 activities per location)
- Supabase handles bulk inserts well (no rate limit issue)

### Database Insert Batching

```python
# Bad: Individual inserts (N+3 database calls per facility)
for facility in facilities:
    supabase.table("cqc_facilities").upsert(facility).execute()
    for activity in facility["activities"]:
        supabase.table("cqc_location_regulated_activities").insert(activity).execute()

# Good: Batch inserts (2-3 database calls total)
supabase.table("cqc_facilities").upsert(facilities, on_conflict="location_id").execute()
all_activities = [a for f in facilities for a in f["activities"]]
supabase.table("cqc_location_regulated_activities").insert(all_activities).execute()
```

**Batch Size Recommendations:**
- Facilities: 100-200 per batch
- Activities: 500-1000 per batch
- Monitor payload size (Supabase has 1MB limit per request)

---

## Migration Strategy

### Phase 1: Add New Column (No Breaking Changes)

```sql
-- Add new JSONB column to existing table
ALTER TABLE cqc_facilities
ADD COLUMN regulated_activities_detailed JSONB;

-- Create GIN index for JSONB queries
CREATE INDEX idx_regulated_activities_detailed
ON cqc_facilities USING GIN (regulated_activities_detailed);
```

**Python:**
```python
# Update transformation to populate both columns
facility_data = transform_facility_data(location)
# Now includes both:
# - regulated_activities (TEXT[])
# - regulated_activities_detailed (JSONB)
```

**Benefits:**
- Backward compatible
- Old code continues working
- New code uses detailed field
- No data loss

---

### Phase 2: Add Junction Table (Optional)

```sql
-- Create activity types reference
CREATE TABLE cqc_regulated_activity_types (
    code VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- Seed with known RA codes (static data)
INSERT INTO cqc_regulated_activity_types (code, name) VALUES
('RA1', 'Assessment or medical treatment for persons detained...'),
('RA2', 'Accommodation for persons who require nursing or personal care'),
('RA3', 'Treatment of disease, disorder or injury'),
-- ... (all 16 codes)
('RA16', 'Transport services, triage and medical advice provided remotely');

-- Create junction table
CREATE TABLE cqc_location_regulated_activities (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL REFERENCES cqc_facilities(location_id) ON DELETE CASCADE,
    activity_code VARCHAR(10) NOT NULL REFERENCES cqc_regulated_activity_types(code),
    contacts JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, activity_code)
);

CREATE INDEX idx_lra_location ON cqc_location_regulated_activities(location_id);
CREATE INDEX idx_lra_activity ON cqc_location_regulated_activities(activity_code);
CREATE INDEX idx_lra_contacts ON cqc_location_regulated_activities USING GIN (contacts);
```

**Python:**
```python
# Populate junction table from existing JSONB data
def populate_junction_table_from_jsonb(supabase: Client):
    """One-time migration: Populate junction table from JSONB."""

    facilities = supabase.table("cqc_facilities").select(
        "location_id, regulated_activities_detailed"
    ).execute()

    activity_rows = []

    for facility in facilities.data:
        location_id = facility["location_id"]
        activities = facility.get("regulated_activities_detailed", [])

        for activity in activities:
            activity_rows.append({
                "location_id": location_id,
                "activity_code": activity["code"],
                "contacts": activity.get("contacts", [])
            })

    # Batch insert
    BATCH_SIZE = 500
    for i in range(0, len(activity_rows), BATCH_SIZE):
        batch = activity_rows[i:i + BATCH_SIZE]
        supabase.table("cqc_location_regulated_activities").insert(batch).execute()

    print(f"Migrated {len(activity_rows)} activity relationships")
```

---

## Recommended Implementation Path

### Step 1: Immediate (No Schema Changes)

1. ✅ Update `transform_regulated_activities()` to extract full detail
2. ✅ Store in existing `regulated_activities_detailed` JSONB column (if exists) or add it
3. ✅ Keep `regulated_activities` TEXT[] for backward compatibility
4. ✅ Test with 10-location sample
5. ✅ Validate JSONB queries work as expected

**Deliverables:**
- Updated Python transformation function
- Sample queries for JSONB extraction
- Test results

---

### Step 2: Optimization (Junction Table - Optional)

1. Create `cqc_regulated_activity_types` reference table
2. Create `cqc_location_regulated_activities` junction table
3. Update sync script to populate both JSONB and junction table
4. Migrate existing data
5. Create API endpoints for activity-based queries

**Deliverables:**
- SQL migration script
- Updated sync logic
- New API endpoints

---

## Sample Code Files

### File 1: `cqc_activity_extraction.py`

```python
"""
CQC Regulated Activities Extraction Module

Extracts regulated activities with codes, names, and contacts from CQC API responses.
"""

from typing import Any, Dict, List, Optional, Tuple


def validate_regulated_activity(activity: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate a single regulated activity entry."""
    errors = []

    code = activity.get("code")
    if not code:
        errors.append("Missing activity code")
    elif not code.startswith("RA"):
        errors.append(f"Invalid activity code format: {code}")

    name = activity.get("name")
    if not name:
        errors.append("Missing activity name")

    contacts = activity.get("contacts", [])
    if contacts and not isinstance(contacts, list):
        errors.append("Contacts must be an array")

    return (len(errors) == 0, errors)


def transform_regulated_activities(
    location: Dict[str, Any],
    validate: bool = True
) -> Dict[str, Any]:
    """
    Extract regulated activities with codes and contacts.

    Args:
        location: Raw location data from CQC API
        validate: Whether to validate activities (default: True)

    Returns:
        {
            "activities_simple": ["Activity 1", ...],      # TEXT[] backward compat
            "activities_detailed": [                       # JSONB detailed data
                {
                    "code": "RA2",
                    "name": "Accommodation...",
                    "contacts": [...]
                }
            ],
            "extraction_errors": [...] # Only if errors occurred
        }
    """
    activities_raw = location.get("regulatedActivities", [])

    activities_simple = []
    activities_detailed = []
    errors = []

    for idx, activity in enumerate(activities_raw):
        if not isinstance(activity, dict):
            errors.append(f"Activity {idx}: Not a dictionary")
            continue

        # Validate if requested
        if validate:
            is_valid, validation_errors = validate_regulated_activity(activity)
            if not is_valid:
                errors.append(f"Activity {idx}: {', '.join(validation_errors)}")
                continue

        # Extract basic fields
        code = activity.get("code")
        name = activity.get("name")

        if not code or not name:
            continue

        # Add to simple list
        activities_simple.append(name)

        # Extract contacts
        contacts_raw = activity.get("contacts", [])
        contacts_processed = []

        for contact in contacts_raw:
            if not isinstance(contact, dict):
                continue

            contact_data = {
                "title": contact.get("personTitle"),
                "given_name": contact.get("personGivenName"),
                "family_name": contact.get("personFamilyName"),
                "roles": contact.get("personRoles", [])
            }

            # Only include if at least one field is present
            if any(v for v in contact_data.values() if v):
                contacts_processed.append(contact_data)

        # Add to detailed list
        activities_detailed.append({
            "code": code,
            "name": name,
            "contacts": contacts_processed
        })

    # Log errors if any
    if errors:
        location_id = location.get("locationId", "unknown")
        print(f"WARN: Errors extracting activities for {location_id}:")
        for error in errors:
            print(f"  - {error}")

    result = {
        "activities_simple": activities_simple if activities_simple else None,
        "activities_detailed": activities_detailed if activities_detailed else None
    }

    if errors:
        result["extraction_errors"] = errors

    return result
```

---

### File 2: `cqc_sync_with_activities.py`

```python
"""
CQC Sync Script with Enhanced Regulated Activities

Usage:
    python cqc_sync_with_activities.py
"""

import os
from typing import Dict, Any
from supabase import create_client, Client
from cqc_activity_extraction import transform_regulated_activities


def transform_facility_data(location: Dict[str, Any]) -> Dict[str, Any]:
    """Transform CQC location data to Supabase format with enhanced activities."""

    # Extract postal address
    postal_address = {
        "address_line_1": location.get("postalAddressLine1"),
        "address_line_2": location.get("postalAddressLine2"),
        "town_city": location.get("postalAddressTownCity"),
        "county": location.get("postalAddressCounty"),
        "postal_code": location.get("postalCode")
    }

    # Extract services
    services_raw = location.get("gacServiceTypes", [])
    services = [
        s.get("name") for s in services_raw
        if isinstance(s, dict) and s.get("name")
    ]

    # ENHANCED: Extract regulated activities
    activities_data = transform_regulated_activities(location)

    # Extract rating
    ratings = location.get("currentRatings", {})
    overall_rating = (
        ratings.get("overall", {}).get("rating")
        if isinstance(ratings, dict) else None
    )

    # Extract primary inspection category
    primary_category_code = None
    primary_category_name = None
    inspection_categories = location.get("inspectionCategories", [])
    for cat in inspection_categories:
        if isinstance(cat, dict) and cat.get("primary") == "true":
            primary_category_code = cat.get("code")
            primary_category_name = cat.get("name")
            break

    return {
        "location_id": location.get("locationId"),
        "provider_id": location.get("providerId"),
        "name": location.get("name"),
        "postal_address": postal_address,
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "services": services if services else None,

        # Backward compatible TEXT[] field
        "regulated_activities": activities_data.get("activities_simple"),

        # NEW: Enhanced JSONB field
        "regulated_activities_detailed": activities_data.get("activities_detailed"),

        "registration_status": location.get("registrationStatus"),
        "overall_rating": overall_rating,
        "inspection_directorate": location.get("inspectionDirectorate"),
        "primary_inspection_category_code": primary_category_code,
        "primary_inspection_category_name": primary_category_name,

        # Complete API response
        "cqc_raw_data": location
    }


def upsert_facility(supabase: Client, facility_data: Dict[str, Any]) -> None:
    """Upsert facility with enhanced regulated activities."""
    try:
        result = supabase.table("cqc_facilities").upsert(
            facility_data,
            on_conflict="location_id"
        ).execute()

        print(f"✓ Upserted: {facility_data['location_id']}")

    except Exception as e:
        print(f"✗ Error: {facility_data.get('location_id')}: {e}")
        raise


if __name__ == "__main__":
    # Initialize Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    supabase = create_client(supabase_url, supabase_key)

    # Example usage
    sample_location = {
        "locationId": "1-10000302982",
        "name": "Henley House",
        "regulatedActivities": [
            {
                "code": "RA2",
                "name": "Accommodation for persons who require nursing or personal care",
                "contacts": [
                    {
                        "personTitle": "Ms",
                        "personGivenName": "Rebecca Jane",
                        "personFamilyName": "Bewley",
                        "personRoles": ["Registered Manager"]
                    }
                ]
            }
        ]
    }

    facility_data = transform_facility_data(sample_location)
    upsert_facility(supabase, facility_data)
```

---

## Summary & Recommendations

### Recommended Approach: Hybrid JSONB + Future Junction Table

**Phase 1 (Immediate):**
1. Add `regulated_activities_detailed` JSONB column
2. Update Python transformation to extract codes + contacts
3. Keep `regulated_activities` TEXT[] for backward compatibility
4. Deploy and test with 10-900 locations

**Phase 2 (Future Optimization):**
1. Create junction table when query performance becomes issue
2. Populate from JSONB data (no re-sync needed)
3. Add API endpoints for activity-based searches

**Why This Approach:**
- ✅ No breaking changes (backward compatible)
- ✅ Fast to implement (single column addition)
- ✅ Complete data preservation (JSONB + raw data)
- ✅ Easy to query initially (JSONB operators)
- ✅ Path to optimization (junction table later)
- ✅ No wasted API calls (data already in raw response)

---

## Files Summary

**Key Files:**
- `C:\Users\chris\myTribe-Development\APIs\CQC\REGULATED_ACTIVITIES_EXTRACTION_DESIGN.md` (this file)
- `C:\Users\chris\myTribe-Development\APIs\CQC\cqc_activity_extraction.py` (to be created)
- `C:\Users\chris\myTribe-Development\mytribe-origin\Data\CQC\initial-implementation\tests\test_900_multi_directorate.py` (update line 298-303)

**Next Steps:**
1. Review with database-expert agent for schema validation
2. Create `cqc_activity_extraction.py` module
3. Update existing sync scripts
4. Test with 10-location sample
5. Deploy to production

---

**Document Version:** 1.0
**Last Updated:** 2025-11-02
**Author:** API Designer Agent
**Status:** Ready for Database Expert Review
