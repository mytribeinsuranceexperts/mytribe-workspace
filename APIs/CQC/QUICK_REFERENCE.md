# CQC Regulated Activities - Quick Reference

## One-Minute Setup

### 1. Add Database Column

```sql
ALTER TABLE cqc_facilities ADD COLUMN regulated_activities_detailed JSONB;
CREATE INDEX idx_regulated_activities_detailed ON cqc_facilities USING GIN (regulated_activities_detailed);
```

### 2. Update Python Code

```python
from cqc_activity_extraction import transform_regulated_activities

# In transform_facility_data():
activities_data = transform_regulated_activities(location)

return {
    # ... other fields ...
    "regulated_activities": activities_data.get("activities_simple"),  # TEXT[]
    "regulated_activities_detailed": activities_data.get("activities_detailed"),  # JSONB
    # ... rest of fields ...
}
```

### 3. Done!

Your sync will now extract:
- Activity codes (RA1-RA16)
- Activity names
- Contact persons (title, name, roles)

---

## Data Structure

### Input (CQC API)

```json
{
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
```

### Output (Database)

**TEXT[] (backward compatible):**
```sql
regulated_activities = ['Accommodation for persons who require nursing or personal care']
```

**JSONB (enhanced):**
```json
{
  "activities_detailed": [
    {
      "code": "RA2",
      "name": "Accommodation for persons who require nursing or personal care",
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
}
```

---

## Common Queries

### Find Facilities with Specific Activity

```python
result = supabase.table("cqc_facilities").select(
    "location_id, name, postal_address"
).filter(
    "regulated_activities_detailed", "cs", '[{"code": "RA5"}]'
).execute()
```

### SQL Query

```sql
SELECT location_id, name, postal_address->>'postal_code' as postcode
FROM cqc_facilities
WHERE regulated_activities_detailed @> '[{"code": "RA5"}]'::jsonb;
```

### Get Activity Codes for a Facility

```python
from cqc_activity_extraction import get_activity_codes

facility = supabase.table("cqc_facilities").select("*").eq("location_id", "1-123").single().execute()
codes = get_activity_codes(facility.data["regulated_activities_detailed"])
# ['RA2', 'RA5', 'RA14']
```

### Find Registered Managers

```python
from cqc_activity_extraction import get_registered_managers

facility = supabase.table("cqc_facilities").select("*").eq("location_id", "1-123").single().execute()
managers = get_registered_managers(facility.data["regulated_activities_detailed"])
# [{"given_name": "Rebecca", "family_name": "Bewley", "roles": ["Registered Manager"], ...}]
```

---

## Helper Functions

### Check if Facility Has Activity

```python
from cqc_activity_extraction import has_activity

activities = facility["regulated_activities_detailed"]
has_surgical = has_activity(activities, "RA14")  # True/False
```

### Get Activity Name by Code

```python
from cqc_activity_extraction import get_activity_name_by_code

name = get_activity_name_by_code("RA5")
# "Treatment of disease, disorder or injury"
```

### Validate Activities

```python
from cqc_activity_extraction import validate_regulated_activity

activity = {"code": "RA5", "name": "Treatment..."}
is_valid, errors = validate_regulated_activity(activity)
```

---

## Activity Codes Reference (RA1-RA16)

| Code | Name |
|------|------|
| RA1 | Assessment or medical treatment for persons detained under the Mental Health Act 1983 |
| RA2 | Accommodation for persons who require nursing or personal care |
| RA3 | Accommodation for persons who require treatment for substance misuse |
| RA4 | Accommodation and nursing or personal care in the further education sector |
| RA5 | Treatment of disease, disorder or injury |
| RA6 | Diagnostic and screening procedures |
| RA7 | Management of supply of blood and blood derived products |
| RA8 | Transport services, triage and medical advice provided remotely |
| RA9 | Maternity and midwifery services |
| RA10 | Termination of pregnancies |
| RA11 | Services in slimming clinics |
| RA12 | Nursing care |
| RA13 | Personal care |
| RA14 | Surgical procedures |
| RA15 | Family planning services |
| RA16 | Treatment of disease, disorder or injury |

---

## Troubleshooting

### Error: Column doesn't exist

```
ERROR: column "regulated_activities_detailed" does not exist
```

**Fix:** Run SQL migration:
```sql
ALTER TABLE cqc_facilities ADD COLUMN regulated_activities_detailed JSONB;
```

### Error: Module not found

```
ModuleNotFoundError: No module named 'cqc_activity_extraction'
```

**Fix:** Copy `cqc_activity_extraction.py` to your project directory or add to PYTHONPATH.

### Warning: Extraction errors

```
WARN: Errors extracting activities for 1-123: Activity 0: Missing code
```

**Meaning:** Some activities in CQC data are malformed. They're skipped but logged. Check `extraction_errors` field in result.

### Query returns no results

**Problem:** JSONB query syntax
```python
# Wrong
.filter("regulated_activities_detailed", "eq", '{"code": "RA5"}')

# Right
.filter("regulated_activities_detailed", "cs", '[{"code": "RA5"}]')
```

**Note:** Use `cs` (contains) operator for JSONB arrays.

---

## Files

- **Design:** `REGULATED_ACTIVITIES_EXTRACTION_DESIGN.md`
- **Module:** `cqc_activity_extraction.py`
- **SQL:** `regulated_activities_schema_options.sql`
- **Examples:** `IMPLEMENTATION_EXAMPLES.md`
- **This:** `QUICK_REFERENCE.md`

---

## Next Steps

1. Add database column (1 minute)
2. Update transform function (2 minutes)
3. Test with 10 locations (5 minutes)
4. Run full sync (18 minutes for 900 locations)
5. Verify queries work

**Total time:** ~30 minutes

---

**Version:** 1.0 | **Updated:** 2025-11-02
