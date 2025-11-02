# CQC Integration Reference

**Quick reference for CQC API integration in mytribe-origin**

**Last Updated:** 2025-11-02
**Status:** Schema Complete - Ready for Testing

---

## 🔑 API Credentials

**Base URL:** `https://api.service.cqc.org.uk/public/v1`

**Authentication Header:**
```
Ocp-Apim-Subscription-Key: f66d77340c8b4134a758513607afba55
```

**Rate Limit:** Self-imposed 100 req/min (0.6s between calls)

---

## 📊 Database Schema Summary

### Tables

**1. cqc_providers** - Provider organizations
- Primary key: `provider_id`
- Basic org info: name, brand, type, address
- Registration info: status, dates

**2. cqc_facilities** - Healthcare locations (main table)
- Primary key: `location_id`
- Foreign key: `provider_id` → cqc_providers
- Structured fields: name, address, services, ratings, etc.
- JSONB fields: `postal_address`, `cqc_raw_data`
- Primary inspection category: `primary_inspection_category_code`, `primary_inspection_category_name`

**3. cqc_regulated_activities** - Reference table of RA codes
- Primary key: `code` (RA1-RA16)
- Contains: 16 regulated activity definitions

**4. cqc_location_regulated_activities** - Junction table
- Composite PK: (`location_id`, `activity_code`)
- Links facilities to their regulated activities
- Stores activity-specific contacts in JSONB

**5. cqc_sync_log** - Sync tracking
- Tracks sync operations and performance

---

## 🎯 Filtering Strategy (Two-Stage)

### Stage 1: List Endpoint (Fast Initial Filter)

Applied during location list fetching:

```python
# Filter by primary inspection category code
primaryInspectionCategoryCode = "H3"  # One code per query

# Categories we're importing (12 total):
CATEGORIES = [
    "H1",   # NHS acute non-specialist hospitals
    "H2",   # NHS acute specialist hospitals
    "H3",   # Independent acute non-specialist hospitals
    "H4",   # Independent acute specialist hospitals
    "H6",   # Community health services
    "H11",  # Acute services non-hospital
    "P1",   # Dentists
    "P2",   # GP Practices
    "P7",   # Independent consulting doctors
    "P3",   # Out of hours
    "P5",   # Remote clinical advice
    "P6"    # Urgent care services
]
```

### Stage 2: Detail Endpoint (Comprehensive Filter)

Applied after fetching full location details:

```python
def should_exclude_service(location):
    """Exclude specific service types (Hospitals only)"""
    directorate = location.get("inspectionDirectorate", "")

    if directorate != "Hospitals":
        return False  # Don't filter GPs/Dentists by service type

    EXCLUDED_KEYWORDS = {
        "rehabilitation services",  # Substance abuse
        "substance abuse",
        "substance misuse",
        "prison",                   # Prison healthcare
        "learning disabilities",    # Community LD services
        "mental health"             # Mental health facilities
    }

    services = location.get("gacServiceTypes", [])
    # Check if any service matches excluded keywords
    # ... (see test_900_multi_directorate.py for full logic)
```

**Additional detail filters:**
- `registrationStatus === "Registered"` (active only)

---

## 🔄 Regulated Activities (Relational Approach)

### How It Works

1. **Reference Table** (`cqc_regulated_activities`)
   - Pre-seeded with 16 regulated activities (RA1-RA16)
   - Provides standardized codes and names

2. **Junction Table** (`cqc_location_regulated_activities`)
   - Links each location to its regulated activities
   - Stores activity-specific contacts
   - Many-to-many relationship

### Data Flow

```
CQC API Response
    ↓
location.regulatedActivities = [
    {code: "RA3", name: "Treatment...", contacts: [...]},
    {code: "RA5", name: "Surgical...", contacts: [...]}
]
    ↓
transform_facility_data()
    ↓
insert_regulated_activities_junction()
    ↓
Junction table rows:
    {location_id: "1-123", activity_code: "RA3", contacts: [...]}
    {location_id: "1-123", activity_code: "RA5", contacts: [...]}
```

### Example Queries

```sql
-- Get all locations with surgical procedures (RA5)
SELECT f.name, f.postal_address->>'town_city' as city
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
WHERE lra.activity_code = 'RA5';

-- Get all activities for a location
SELECT ra.code, ra.name, lra.contacts
FROM cqc_location_regulated_activities lra
JOIN cqc_regulated_activities ra ON lra.activity_code = ra.code
WHERE lra.location_id = '1-123456789';

-- Count locations by regulated activity
SELECT ra.code, ra.name, COUNT(lra.location_id) as location_count
FROM cqc_regulated_activities ra
LEFT JOIN cqc_location_regulated_activities lra ON ra.code = lra.activity_code
GROUP BY ra.code, ra.name
ORDER BY location_count DESC;
```

---

## 📝 Regulated Activities Reference

| Code  | Name | Description |
|-------|------|-------------|
| RA1   | Accommodation for persons who require nursing or personal care | Residential accommodation services |
| RA2   | Accommodation for persons who require treatment for substance misuse | Substance abuse treatment |
| RA3   | Treatment of disease, disorder or injury | General medical treatment |
| RA4   | Assessment or medical treatment for persons detained under MHA 1983 | Mental health assessment under MHA |
| RA5   | Surgical procedures | Surgical operations |
| RA6   | Diagnostic and screening procedures | Medical diagnostics and screening |
| RA7   | Management of supply of blood and blood derived products | Blood transfusion services |
| RA8   | Transport services, triage and medical advice provided remotely | Ambulance and telehealth |
| RA9   | Maternity and midwifery services | Pregnancy and childbirth care |
| RA10  | Termination of pregnancies | Abortion services |
| RA11  | Services in slimming clinics | Weight management |
| RA12  | Nursing care | Professional nursing |
| RA13  | Personal care | Daily living assistance |
| RA14  | Treatment of mental health, learning disability and dementia | Mental health and cognitive care |
| RA15  | Family planning services | Contraception and reproductive health |
| RA16  | Hospice services | End-of-life and palliative care |

---

## 🏃 Running Tests

### Quick Test (10 locations)

```powershell
cd mytribe-origin\Data\CQC\initial-implementation\tests
powershell -ExecutionPolicy Bypass -File test_quick.ps1
```

### Multi-Directorate Test (12 categories, ~925 locations)

```powershell
cd mytribe-origin\Data\CQC\initial-implementation\tests
powershell -ExecutionPolicy Bypass -File test_900.ps1
```

**Expected Duration:**
- 10 locations: ~2 minutes
- 925 locations: ~15-20 minutes

---

## 🗂️ File Locations

### Implementation Files

**Python Test Scripts:**
```
mytribe-origin\Data\CQC\initial-implementation\tests\
├── test_10_quick.py           # Quick 10-location test
├── test_900_multi_directorate.py  # 12 categories, ~925 locations
├── test_quick.ps1             # PowerShell runner for quick test
└── test_900.ps1               # PowerShell runner for multi-directorate
```

**Supabase Migrations:**
```
mytribe-origin\supabase\migrations\
├── YYYYMMDD*_initial_cqc_schema.sql
├── YYYYMMDD*_add_primary_inspection_category_fields.sql
├── YYYYMMDD*_rollback_regulated_activities_jsonb.sql
├── YYYYMMDD*_create_regulated_activities_tables.sql
└── YYYYMMDD*_seed_regulated_activities.sql
```

### Documentation Files

**APIs\CQC\** (Quick reference and compliance)
- `README.md` - Filter strategy and data scope
- `COMPLIANCE.md` - Compliance checklist
- `COMPLIANCE_REPORT.md` - Detailed compliance analysis

**mytribe-origin\Data\CQC\** (Implementation status)
- `README.md` - Implementation status and next steps
- `initial-implementation\SCHEMA_CHANGES_APPLIED.md` - Schema changelog

**Archived:**
- Research docs: `APIs\CQC\archive\research-2025-11\`
- Session transcripts: `APIs\CQC\archive\sessions-2025-11\`
- Test outputs: `APIs\CQC\archive\test-outputs-2025-11\`

---

## 🔍 Verification Queries

### Check Imported Data

```sql
-- Count facilities by inspection category
SELECT
    primary_inspection_category_code as code,
    primary_inspection_category_name as category,
    COUNT(*) as count
FROM cqc_facilities
GROUP BY code, category
ORDER BY code;

-- Verify regulated activities were linked
SELECT
    COUNT(DISTINCT location_id) as facilities_with_activities
FROM cqc_location_regulated_activities;

-- Check most common regulated activities
SELECT
    ra.code,
    ra.name,
    COUNT(lra.location_id) as facility_count
FROM cqc_regulated_activities ra
LEFT JOIN cqc_location_regulated_activities lra ON ra.code = lra.activity_code
GROUP BY ra.code, ra.name
ORDER BY facility_count DESC;

-- Sample facility with full details
SELECT
    f.location_id,
    f.name,
    f.primary_inspection_category_name,
    f.postal_address->>'town_city' as city,
    array_agg(ra.code) as activity_codes
FROM cqc_facilities f
LEFT JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
LEFT JOIN cqc_regulated_activities ra ON lra.activity_code = ra.code
GROUP BY f.location_id, f.name, f.primary_inspection_category_name, city
LIMIT 5;
```

---

## 📞 Next Steps

1. ✅ **Schema Complete** - All migrations applied
2. ✅ **Scripts Updated** - Relational approach implemented
3. ⏳ **Testing** - Run multi-directorate test when network stable
4. ⏳ **Edge Function** - Create TypeScript edge function for scheduled sync
5. ⏳ **Scheduling** - Set up daily incremental sync

---

## 🚨 Important Notes

- **JSONB Rollback Complete**: Switched from JSONB to relational junction tables for regulated activities
- **Network Issues**: Python test may fail with DNS errors - MCP Supabase tools work fine
- **Rate Limits**: Currently self-imposed at 100 req/min - must confirm with CQC before production
- **Primary Category**: Each location has exactly one primary inspection category (stored on facility record)
- **Regulated Activities**: Many-to-many relationship via junction table (each location can have multiple)

---

**For detailed compliance information:** See [COMPLIANCE_REPORT.md](COMPLIANCE_REPORT.md)
**For implementation status:** See [mytribe-origin/Data/CQC/README.md](../../mytribe-origin/Data/CQC/README.md)
