# Production Backend Failures - Critical Fixes Required

**Status:** 🔴 BLOCKING - Backend returning 500 errors

**Root Causes Identified (from Railway logs):**

1. ❌ **Missing `metadata` column in `query_audit_log` table**
   - Error: `sqlalchemy.exc.ProgrammingError: column query_audit_log.metadata does not exist`
   - Column is defined in model but wasn't migrated to production
   - Affects: All queries to history endpoint

2. ❌ **Missing `admin_email` in Settings class**
   - Error: `AttributeError: 'Settings' object has no attribute 'admin_email'`
   - startup.py expects `admin_email`, `admin_password`, `admin_name` fields
   - Affects: Backend startup (currently silently fails during lifespan)

---

## Fixes Applied

### ✅ Fix #1: Added Admin Settings to config.py

```python
# Admin user creation at startup (optional)
admin_email: Optional[str] = Field(default=None, alias="ADMIN_EMAIL")
admin_password: Optional[str] = Field(default=None, alias="ADMIN_PASSWORD")
admin_name: Optional[str] = Field(default="Admin", alias="ADMIN_NAME")
```

**File:** `backend/app/config.py` (lines 80-83)
**Impact:** Allows startup.py to run without AttributeError, makes admin creation optional

### ⏳ Fix #2: Add Missing `metadata` Column (REQUIRES MANUAL ACTION)

**SQL Command to Run:**

```sql
ALTER TABLE query_audit_log
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
```

**Location:** `backend/scripts/add_metadata_column.sql`

**How to Execute:**

**Option A: Via Railway Dashboard (Recommended)**
1. Go to https://railway.app → myTribe project
2. Select **postgres** service (not backend)
3. Click **Connect** tab
4. Copy the connection string
5. Run the SQL command in your SQL client OR
6. Use Railway Data Browser if available

**Option B: Via Local psql (If you have it installed)**
```bash
PGPASSWORD="[YOUR_DB_PASSWORD]" psql \
  -h tramway.proxy.rlwy.net \
  -U postgres \
  -p 27566 \
  -d railway \
  -c "ALTER TABLE query_audit_log ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;"
```
(Substitute your database password for `[YOUR_DB_PASSWORD]`)

**Verification:**
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'query_audit_log' AND column_name = 'metadata';
-- Should return: metadata | jsonb
```

---

## Next Steps

### 1. Execute the SQL Fix (CRITICAL)

Run the ALTER TABLE command above to add the missing column. Without this, the backend will continue to fail when querying history.

### 2. Commit and Push Code Fix

After the SQL is run in the database, commit the config.py fix:

```bash
git add backend/app/config.py
git commit -m "fix: Add missing admin_email settings to prevent startup errors

- Add optional admin_email, admin_password, admin_name fields to Settings
- Allows startup.py to gracefully skip admin creation if not configured
- Prevents AttributeError during application lifespan

Impact: Backend now starts without 'admin_email' errors"

git push origin main
```

### 3. Verify Backend Recovery

After:
- ✅ metadata column added to database
- ✅ config.py changes pushed to GitHub

Railway will automatically redeploy. Check:

1. **Backend Status** - No 500 errors on startup
2. **Query History** - Frontend can load `/api/query/history`
3. **Query Execution** - Can execute new queries
4. **Logs** - Should show `INFO: Application startup complete`

---

## What These Fixes Resolve

### metadata Column
- ✅ Query history endpoint returns data without ProgrammingError
- ✅ Audit logs store all query metadata correctly
- ✅ Frontend can load and display query history

### admin_email Settings
- ✅ Backend starts without AttributeError
- ✅ Startup tasks run cleanly (admin creation is optional)
- ✅ No more "An unexpected error occurred" messages

---

## Current Error Summary

**Frontend sees:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later."
}
```

**Backend logs show:**
1. **Primary error:** `column query_audit_log.metadata does not exist`
   - Happens when history endpoint tries to query AuditLog

2. **Secondary error:** `'Settings' object has no attribute 'admin_email'`
   - Happens during startup tasks

**After fixes:**
- Both errors resolved
- Backend fully operational
- Query history loads
- New queries execute with AI

---

## Timeline

- **Code Fix:** ✅ Applied (config.py)
- **Database Migration:** ⏳ Waiting for SQL execution
- **Verification:** ⏳ After both fixes applied

---

**Critical Action:** Run the ALTER TABLE SQL command to add the metadata column. This is the blocking issue preventing the backend from functioning.
