# CQC Regulated Activities - Implementation Examples

## Quick Start Guide

This document provides copy-paste examples for implementing regulated activities extraction in your CQC sync scripts.

---

## Example 1: Update Existing Sync Script (Minimal Changes)

### Current Code (Line 298-303 in test_900_multi_directorate.py)

```python
# Extract regulated activities
activities_raw = location.get("regulatedActivities", [])
regulated_activities = [
    a.get("name") for a in activities_raw
    if isinstance(a, dict) and a.get("name")
]
```

### Updated Code (Enhanced Extraction)

```python
# Import the extraction module
from cqc_activity_extraction import transform_regulated_activities

# Extract regulated activities with full detail
activities_data = transform_regulated_activities(location)

# Both formats available:
regulated_activities = activities_data.get("activities_simple")  # TEXT[] backward compat
regulated_activities_detailed = activities_data.get("activities_detailed")  # JSONB full detail
```

---

## Example 2: Complete Transform Function Update

```python
def transform_facility_data(location: Dict[str, Any]) -> Dict[str, Any]:
    """Transform CQC location data to Supabase format."""
    from cqc_activity_extraction import transform_regulated_activities

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

    # ENHANCED: Extract regulated activities with codes and contacts
    activities_data = transform_regulated_activities(location, verbose=False)

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

        # BACKWARD COMPATIBLE: Keep old field (TEXT[])
        "regulated_activities": activities_data.get("activities_simple"),

        # NEW: Full detail extraction (JSONB)
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

## Example 3: Upsert to Supabase (Single Facility)

```python
from supabase import Client

def upsert_facility(supabase: Client, facility_data: Dict[str, Any]) -> None:
    """
    Upsert a single facility with enhanced regulated activities.

    Args:
        supabase: Supabase client instance
        facility_data: Transformed facility data

    Raises:
        Exception: If upsert fails
    """
    try:
        result = supabase.table("cqc_facilities").upsert(
            facility_data,
            on_conflict="location_id"
        ).execute()

        location_id = facility_data.get("location_id")
        print(f"✓ Upserted facility: {location_id}")

        return result

    except Exception as e:
        print(f"✗ Error upserting {facility_data.get('location_id')}: {e}")
        raise
```

---

## Example 4: Batch Upsert (900 Facilities)

```python
from typing import List, Dict, Any
from supabase import Client

async def batch_upsert_facilities(
    supabase: Client,
    facilities: List[Dict[str, Any]],
    batch_size: int = 100
) -> Dict[str, int]:
    """
    Batch upsert facilities to Supabase with progress tracking.

    Args:
        supabase: Supabase client instance
        facilities: List of transformed facility data
        batch_size: Number of facilities per batch (default: 100)

    Returns:
        Statistics dictionary with counts
    """
    stats = {
        "total": len(facilities),
        "upserted": 0,
        "errors": 0
    }

    print(f"\nBatch upserting {len(facilities)} facilities...")
    print(f"Batch size: {batch_size}")

    for i in range(0, len(facilities), batch_size):
        batch = facilities[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(facilities) + batch_size - 1) // batch_size

        try:
            result = supabase.table("cqc_facilities").upsert(
                batch,
                on_conflict="location_id"
            ).execute()

            stats["upserted"] += len(batch)

            print(f"  Batch {batch_num}/{total_batches}: ✓ {len(batch)} facilities "
                  f"({stats['upserted']}/{stats['total']})")

        except Exception as e:
            stats["errors"] += len(batch)
            print(f"  Batch {batch_num}/{total_batches}: ✗ Error: {e}")

            # Optionally retry individual items in failed batch
            for facility in batch:
                try:
                    supabase.table("cqc_facilities").upsert(
                        facility,
                        on_conflict="location_id"
                    ).execute()
                    stats["upserted"] += 1
                    stats["errors"] -= 1
                except Exception as retry_error:
                    print(f"    ✗ Failed: {facility.get('location_id')}: {retry_error}")

    print(f"\n✓ Batch upsert complete:")
    print(f"  Total: {stats['total']}")
    print(f"  Upserted: {stats['upserted']}")
    print(f"  Errors: {stats['errors']}")

    return stats
```

---

## Example 5: Query Examples (Using JSONB)

### Python: Find Facilities with RA5

```python
def find_facilities_with_activity(
    supabase: Client,
    activity_code: str
) -> List[Dict[str, Any]]:
    """
    Find all facilities offering a specific regulated activity.

    Args:
        supabase: Supabase client instance
        activity_code: Activity code (e.g., "RA5")

    Returns:
        List of facilities with that activity
    """
    try:
        result = supabase.table("cqc_facilities").select(
            "location_id, name, postal_address, regulated_activities_detailed"
        ).filter(
            "regulated_activities_detailed",
            "cs",  # contains (JSONB contains operator)
            f'[{{"code": "{activity_code}"}}]'
        ).execute()

        facilities = result.data
        print(f"Found {len(facilities)} facilities with {activity_code}")

        return facilities

    except Exception as e:
        print(f"Error querying facilities: {e}")
        return []
```

### Python: Get Registered Managers for a Facility

```python
def get_facility_managers(
    supabase: Client,
    location_id: str
) -> List[Dict[str, Any]]:
    """
    Get all registered managers for a facility.

    Args:
        supabase: Supabase client instance
        location_id: CQC location ID

    Returns:
        List of manager details with their activities
    """
    from cqc_activity_extraction import get_registered_managers

    try:
        result = supabase.table("cqc_facilities").select(
            "location_id, name, regulated_activities_detailed"
        ).eq("location_id", location_id).single().execute()

        facility = result.data
        activities = facility.get("regulated_activities_detailed", [])

        managers = get_registered_managers(activities)

        print(f"Found {len(managers)} registered managers for {facility['name']}")

        return managers

    except Exception as e:
        print(f"Error getting managers: {e}")
        return []
```

---

## Example 6: Data Validation Before Upsert

```python
def validate_and_transform_facility(
    location: Dict[str, Any]
) -> tuple[Dict[str, Any] | None, List[str]]:
    """
    Validate and transform facility data before upserting.

    Args:
        location: Raw CQC API location response

    Returns:
        Tuple of (facility_data, errors)
        - facility_data is None if validation fails
        - errors is list of validation error messages
    """
    errors = []

    # Required fields validation
    location_id = location.get("locationId")
    if not location_id:
        errors.append("Missing locationId")

    name = location.get("name")
    if not name:
        errors.append("Missing name")

    registration_status = location.get("registrationStatus")
    if registration_status != "Registered":
        errors.append(f"Invalid registration status: {registration_status}")

    # If critical errors, return None
    if errors:
        return (None, errors)

    # Transform with activity extraction
    try:
        facility_data = transform_facility_data(location)

        # Check for activity extraction errors
        activities_data = facility_data.get("regulated_activities_detailed")
        if activities_data and isinstance(activities_data, dict):
            extraction_errors = activities_data.get("extraction_errors", [])
            if extraction_errors:
                errors.extend(extraction_errors)

        return (facility_data, errors)

    except Exception as e:
        errors.append(f"Transformation failed: {str(e)}")
        return (None, errors)
```

---

## Example 7: Complete Sync Script Integration

```python
#!/usr/bin/env python3
"""
Enhanced CQC Sync Script with Regulated Activities Extraction

Usage:
    export CQC_API_KEY='your-key'
    export SUPABASE_URL='your-url'
    export SUPABASE_SERVICE_KEY='your-key'
    python enhanced_cqc_sync.py
"""

import asyncio
import os
import sys
from typing import List, Dict, Any

import httpx
from supabase import create_client, Client
from cqc_activity_extraction import transform_regulated_activities

# Import your existing CQC client
from cqc_api_client import CQCAPIClient


async def fetch_and_sync_location(
    cqc_client: CQCAPIClient,
    supabase: Client,
    location_id: str
) -> bool:
    """
    Fetch a single location and sync to database.

    Args:
        cqc_client: CQC API client
        supabase: Supabase client
        location_id: CQC location ID

    Returns:
        True if successful, False otherwise
    """
    try:
        # Fetch detailed location data
        location = await cqc_client.fetch_location_details(location_id)

        if not location:
            print(f"✗ No data for {location_id}")
            return False

        # Validate and transform
        facility_data, errors = validate_and_transform_facility(location)

        if not facility_data:
            print(f"✗ Validation failed for {location_id}: {', '.join(errors)}")
            return False

        # Log warnings if any
        if errors:
            print(f"⚠ Warnings for {location_id}: {', '.join(errors)}")

        # Upsert to database
        upsert_facility(supabase, facility_data)

        return True

    except Exception as e:
        print(f"✗ Error processing {location_id}: {e}")
        return False


async def main():
    """Main sync function."""
    # Initialize clients
    cqc_api_key = os.getenv("CQC_API_KEY")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not all([cqc_api_key, supabase_url, supabase_key]):
        print("ERROR: Missing required environment variables")
        sys.exit(1)

    cqc_client = CQCAPIClient(cqc_api_key)
    supabase = create_client(supabase_url, supabase_key)

    # Example: Sync 10 locations
    test_location_ids = [
        "1-10000302982",
        "1-10000697432",
        # ... add more
    ]

    print(f"Syncing {len(test_location_ids)} locations...")

    successes = 0
    failures = 0

    for location_id in test_location_ids:
        success = await fetch_and_sync_location(cqc_client, supabase, location_id)
        if success:
            successes += 1
        else:
            failures += 1

    print(f"\n✓ Sync complete:")
    print(f"  Successes: {successes}")
    print(f"  Failures: {failures}")

    await cqc_client.close()


if __name__ == "__main__":
    asyncio.run(main())
```

---

## Example 8: Testing the Extraction Module

```python
#!/usr/bin/env python3
"""Test the activity extraction module with real CQC data."""

import json
from cqc_activity_extraction import (
    transform_regulated_activities,
    get_activity_codes,
    get_registered_managers,
    has_activity
)

# Sample CQC location data
sample_location = {
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
        },
        {
            "name": "Treatment of disease, disorder or injury",
            "code": "RA5",
            "contacts": []
        }
    ]
}

def test_extraction():
    """Test activity extraction."""
    print("Testing CQC Activity Extraction")
    print("=" * 60)

    # Extract activities
    result = transform_regulated_activities(sample_location, verbose=True)

    # Test 1: Simple list
    print("\n1. Simple List (TEXT[]):")
    print(result["activities_simple"])
    assert len(result["activities_simple"]) == 2
    print("✓ Extracted 2 activity names")

    # Test 2: Detailed list
    print("\n2. Detailed List (JSONB):")
    print(json.dumps(result["activities_detailed"], indent=2))
    assert len(result["activities_detailed"]) == 2
    print("✓ Extracted 2 detailed activities")

    # Test 3: Activity codes
    print("\n3. Activity Codes:")
    codes = get_activity_codes(result["activities_detailed"])
    print(codes)
    assert codes == ["RA2", "RA5"]
    print("✓ Extracted codes: RA2, RA5")

    # Test 4: Registered managers
    print("\n4. Registered Managers:")
    managers = get_registered_managers(result["activities_detailed"])
    print(json.dumps(managers, indent=2))
    assert len(managers) == 1
    assert managers[0]["family_name"] == "Bewley"
    print("✓ Found 1 registered manager")

    # Test 5: Activity checks
    print("\n5. Activity Checks:")
    assert has_activity(result["activities_detailed"], "RA2") == True
    assert has_activity(result["activities_detailed"], "RA5") == True
    assert has_activity(result["activities_detailed"], "RA99") == False
    print("✓ Activity checks working")

    # Test 6: Error handling
    print("\n6. Error Handling:")
    bad_location = {
        "locationId": "test",
        "regulatedActivities": [
            {"name": "No code"},  # Missing code
            {"code": "RA1"},      # Missing name
            "not a dict"          # Invalid type
        ]
    }
    bad_result = transform_regulated_activities(bad_location, verbose=False)
    assert bad_result["activities_detailed"] is None
    assert len(bad_result["extraction_errors"]) > 0
    print("✓ Error handling working")

    print("\n" + "=" * 60)
    print("✓ All tests passed!")


if __name__ == "__main__":
    test_extraction()
```

---

## Implementation Checklist

### Phase 1: Immediate Implementation (JSONB Only)

- [ ] Copy `cqc_activity_extraction.py` to your project
- [ ] Run SQL migration (Option 1 from `regulated_activities_schema_options.sql`)
- [ ] Update `transform_facility_data()` function
- [ ] Test with 10 locations
- [ ] Run full sync (900+ locations)
- [ ] Verify JSONB queries work
- [ ] Update API endpoints to expose activity data

### Phase 2: Optional Optimization (Junction Table)

- [ ] Run SQL migration (Option 2 from `regulated_activities_schema_options.sql`)
- [ ] Update sync script to populate junction table
- [ ] Run migration script to populate from JSONB
- [ ] Test junction table queries
- [ ] Update API endpoints to use junction table
- [ ] Monitor query performance

---

## Common Pitfalls

### 1. Missing Module Import

**Wrong:**
```python
# Module not imported
activities_data = transform_regulated_activities(location)  # NameError
```

**Right:**
```python
from cqc_activity_extraction import transform_regulated_activities

activities_data = transform_regulated_activities(location)
```

### 2. Forgetting to Add Column to Database

**Error:**
```
ERROR: column "regulated_activities_detailed" does not exist
```

**Fix:**
```sql
ALTER TABLE cqc_facilities ADD COLUMN regulated_activities_detailed JSONB;
```

### 3. Not Handling None Values

**Wrong:**
```python
for activity in result["activities_detailed"]:  # TypeError if None
    print(activity)
```

**Right:**
```python
activities = result.get("activities_detailed", [])
if activities:
    for activity in activities:
        print(activity)
```

---

## Performance Tips

1. **Batch upserts** - Use 100-200 facilities per batch
2. **Index JSONB columns** - Create GIN indexes for fast queries
3. **Cache activity types** - Load `REGULATED_ACTIVITY_TYPES` once
4. **Async processing** - Use `asyncio` for parallel API calls
5. **Monitor query plans** - Use `EXPLAIN ANALYZE` to check index usage

---

## Support

For questions or issues:

1. Check the design document: `REGULATED_ACTIVITIES_EXTRACTION_DESIGN.md`
2. Review SQL schema options: `regulated_activities_schema_options.sql`
3. Test with the extraction module: `cqc_activity_extraction.py`
4. Consult database-expert agent for schema optimization

---

**Document Version:** 1.0
**Last Updated:** 2025-11-02
**Status:** Ready for Implementation
