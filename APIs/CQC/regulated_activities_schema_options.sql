-- ============================================================================
-- CQC Regulated Activities - Database Schema Options
-- ============================================================================
--
-- This file contains SQL migration scripts for different implementation approaches.
-- Choose the option that best fits your requirements.
--
-- Author: API Designer Agent
-- Date: 2025-11-02
-- ============================================================================

-- ============================================================================
-- OPTION 1: JSONB Column Only (Recommended for Immediate Implementation)
-- ============================================================================
--
-- Pros:
-- - No breaking changes
-- - Fast to implement
-- - Complete data preservation
-- - Flexible for future CQC API changes
--
-- Cons:
-- - Slower queries for large datasets
-- - Requires JSONB query knowledge
-- ============================================================================

-- Add new JSONB column to existing cqc_facilities table
ALTER TABLE cqc_facilities
ADD COLUMN IF NOT EXISTS regulated_activities_detailed JSONB;

-- Create GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_regulated_activities_detailed
ON cqc_facilities USING GIN (regulated_activities_detailed);

-- Optional: Add comment for documentation
COMMENT ON COLUMN cqc_facilities.regulated_activities_detailed IS
'JSONB array of regulated activities with codes and contacts. Format: [{"code": "RA2", "name": "...", "contacts": [...]}]';

-- ============================================================================
-- Example Queries for JSONB Approach
-- ============================================================================

-- Find all locations offering RA5 (Treatment of disease, disorder or injury)
SELECT location_id, name, postal_address->>'postal_code' as postcode
FROM cqc_facilities
WHERE regulated_activities_detailed @> '[{"code": "RA5"}]'::jsonb;

-- Find locations with registered managers
SELECT location_id, name,
  jsonb_path_query(
    regulated_activities_detailed,
    '$[*].contacts[*] ? (@.roles[*] == "Registered Manager")'
  ) as managers
FROM cqc_facilities
WHERE regulated_activities_detailed @@ '$.contacts[*].roles[*] == "Registered Manager"';

-- Count facilities per activity code
SELECT
  activity->>'code' as activity_code,
  activity->>'name' as activity_name,
  COUNT(DISTINCT location_id) as facility_count
FROM cqc_facilities,
  jsonb_array_elements(regulated_activities_detailed) as activity
GROUP BY activity->>'code', activity->>'name'
ORDER BY facility_count DESC;

-- Find all activities and managers for a specific location
SELECT
  location_id,
  name,
  activity->>'code' as activity_code,
  activity->>'name' as activity_name,
  contact->>'given_name' as manager_given_name,
  contact->>'family_name' as manager_family_name
FROM cqc_facilities,
  jsonb_array_elements(regulated_activities_detailed) as activity,
  jsonb_array_elements(activity->'contacts') as contact
WHERE location_id = '1-10000302982'
  AND contact->'roles' @> '["Registered Manager"]'::jsonb;

-- ============================================================================
-- OPTION 2: Junction Table (For Future Optimization)
-- ============================================================================
--
-- Pros:
-- - Fast relational queries
-- - Proper database normalization
-- - Easy joins and aggregations
-- - Referential integrity
--
-- Cons:
-- - More complex upsert logic
-- - Requires migration script
-- - Duplicate storage (JSONB + junction table)
-- ============================================================================

-- Step 1: Create reference table for activity types (static data)
CREATE TABLE IF NOT EXISTS cqc_regulated_activity_types (
    code VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed with known RA codes (RA1-RA16)
INSERT INTO cqc_regulated_activity_types (code, name) VALUES
('RA1', 'Assessment or medical treatment for persons detained under the Mental Health Act 1983'),
('RA2', 'Accommodation for persons who require nursing or personal care'),
('RA3', 'Accommodation for persons who require treatment for substance misuse'),
('RA4', 'Accommodation and nursing or personal care in the further education sector'),
('RA5', 'Treatment of disease, disorder or injury'),
('RA6', 'Diagnostic and screening procedures'),
('RA7', 'Management of supply of blood and blood derived products'),
('RA8', 'Transport services, triage and medical advice provided remotely'),
('RA9', 'Maternity and midwifery services'),
('RA10', 'Termination of pregnancies'),
('RA11', 'Services in slimming clinics'),
('RA12', 'Nursing care'),
('RA13', 'Personal care'),
('RA14', 'Surgical procedures'),
('RA15', 'Family planning services'),
('RA16', 'Treatment of disease, disorder or injury')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Create junction table for location-activity relationships
CREATE TABLE IF NOT EXISTS cqc_location_regulated_activities (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL,
    activity_code VARCHAR(10) NOT NULL,
    contacts JSONB,  -- Store contacts as JSONB (flexible structure)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_location
        FOREIGN KEY (location_id)
        REFERENCES cqc_facilities(location_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_type
        FOREIGN KEY (activity_code)
        REFERENCES cqc_regulated_activity_types(code)
        ON DELETE RESTRICT,

    -- Prevent duplicate location-activity pairs
    CONSTRAINT unique_location_activity
        UNIQUE (location_id, activity_code)
);

-- Step 3: Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_lra_location
ON cqc_location_regulated_activities(location_id);

CREATE INDEX IF NOT EXISTS idx_lra_activity
ON cqc_location_regulated_activities(activity_code);

CREATE INDEX IF NOT EXISTS idx_lra_contacts
ON cqc_location_regulated_activities USING GIN (contacts);

-- Step 4: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lra_updated_at
    BEFORE UPDATE ON cqc_location_regulated_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE cqc_location_regulated_activities IS
'Junction table linking CQC locations to their regulated activities. Contacts stored as JSONB for flexibility.';

COMMENT ON COLUMN cqc_location_regulated_activities.contacts IS
'JSONB array of contact persons for this activity at this location. Format: [{"title": "Ms", "given_name": "...", "family_name": "...", "roles": ["Registered Manager"]}]';

-- ============================================================================
-- Example Queries for Junction Table Approach
-- ============================================================================

-- Find all locations offering RA5
SELECT
    f.location_id,
    f.name,
    f.postal_address->>'postal_code' as postcode,
    rat.name as activity_name
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
JOIN cqc_regulated_activity_types rat ON lra.activity_code = rat.code
WHERE lra.activity_code = 'RA5';

-- Count facilities per activity (FAST with indexes)
SELECT
    rat.code,
    rat.name,
    COUNT(DISTINCT lra.location_id) as facility_count
FROM cqc_regulated_activity_types rat
LEFT JOIN cqc_location_regulated_activities lra ON rat.code = lra.activity_code
GROUP BY rat.code, rat.name
ORDER BY facility_count DESC;

-- Find all activities for a location with registered managers
SELECT
    f.name as facility_name,
    rat.name as activity_name,
    contact->>'given_name' || ' ' || contact->>'family_name' as manager_name
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
JOIN cqc_regulated_activity_types rat ON lra.activity_code = rat.code,
  jsonb_array_elements(lra.contacts) as contact
WHERE f.location_id = '1-10000302982'
  AND contact->'roles' @> '["Registered Manager"]'::jsonb;

-- Find locations with multiple activities (e.g., dental + surgical)
SELECT
    f.location_id,
    f.name,
    array_agg(rat.name) as activities
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
JOIN cqc_regulated_activity_types rat ON lra.activity_code = rat.code
WHERE lra.activity_code IN ('RA5', 'RA14')  -- Treatment + Surgical
GROUP BY f.location_id, f.name
HAVING COUNT(DISTINCT lra.activity_code) = 2;

-- ============================================================================
-- Migration: Populate Junction Table from JSONB
-- ============================================================================
-- Use this to migrate existing JSONB data to junction table
-- ============================================================================

INSERT INTO cqc_location_regulated_activities (location_id, activity_code, contacts)
SELECT
    f.location_id,
    activity->>'code' as activity_code,
    activity->'contacts' as contacts
FROM cqc_facilities f,
  jsonb_array_elements(f.regulated_activities_detailed) as activity
WHERE f.regulated_activities_detailed IS NOT NULL
  AND activity->>'code' IS NOT NULL
ON CONFLICT (location_id, activity_code) DO UPDATE
SET
    contacts = EXCLUDED.contacts,
    updated_at = NOW();

-- ============================================================================
-- Cleanup/Rollback Scripts
-- ============================================================================

-- Rollback Option 1 (JSONB only)
-- ALTER TABLE cqc_facilities DROP COLUMN IF EXISTS regulated_activities_detailed;
-- DROP INDEX IF EXISTS idx_regulated_activities_detailed;

-- Rollback Option 2 (Junction table)
-- DROP TRIGGER IF EXISTS update_lra_updated_at ON cqc_location_regulated_activities;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS cqc_location_regulated_activities;
-- DROP TABLE IF EXISTS cqc_regulated_activity_types;

-- ============================================================================
-- Performance Testing Queries
-- ============================================================================

-- Check JSONB index usage
EXPLAIN ANALYZE
SELECT location_id, name
FROM cqc_facilities
WHERE regulated_activities_detailed @> '[{"code": "RA5"}]'::jsonb;

-- Check junction table index usage
EXPLAIN ANALYZE
SELECT f.location_id, f.name
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
WHERE lra.activity_code = 'RA5';

-- Compare query performance
SELECT
    'JSONB' as method,
    COUNT(*) as result_count
FROM cqc_facilities
WHERE regulated_activities_detailed @> '[{"code": "RA5"}]'::jsonb

UNION ALL

SELECT
    'Junction Table' as method,
    COUNT(DISTINCT f.location_id) as result_count
FROM cqc_facilities f
JOIN cqc_location_regulated_activities lra ON f.location_id = lra.location_id
WHERE lra.activity_code = 'RA5';

-- ============================================================================
-- Data Quality Checks
-- ============================================================================

-- Check for missing activity codes
SELECT location_id, name
FROM cqc_facilities
WHERE regulated_activities_detailed IS NOT NULL
  AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(regulated_activities_detailed) as activity
      WHERE activity->>'code' IS NULL OR activity->>'code' = ''
  );

-- Check for orphaned junction table entries (should return 0 if constraints work)
SELECT lra.location_id, lra.activity_code
FROM cqc_location_regulated_activities lra
LEFT JOIN cqc_facilities f ON lra.location_id = f.location_id
WHERE f.location_id IS NULL;

-- Count facilities with no regulated activities
SELECT COUNT(*) as facilities_without_activities
FROM cqc_facilities
WHERE regulated_activities_detailed IS NULL
   OR jsonb_array_length(regulated_activities_detailed) = 0;

-- ============================================================================
-- End of Schema Options
-- ============================================================================
