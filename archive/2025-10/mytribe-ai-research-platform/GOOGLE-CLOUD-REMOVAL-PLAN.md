# Google Cloud Removal Action Plan

**Status:** Ready for Implementation
**Risk Level:** Minimal
**Estimated Time:** 10 minutes
**Files to Modify:** 2

---

## Quick Summary

The mytribe-ai-research-platform has two test files with Google Cloud imports that are obsolete. These are **safe to remove** because:

1. They only import `google.api_core.exceptions` for mocking
2. The application uses Claude API, not Vertex AI
3. All GCP infrastructure was removed (Railway deployment)
4. Tests will work identically with standard Python exceptions

---

## Files to Modify

### File 1: `backend/tests/integration/test_end_to_end_pipeline.py`

**Location:** Lines 375-403

**Current:**
```python
def test_ai_generation_failure_pipeline(self, full_pipeline_mocks):
    """Test: Pipeline handles AI generation failures gracefully"""
    mocks = full_pipeline_mocks

    from google.api_core import exceptions

    # AI generation fails
    mocks["langchain"].generate_sql.side_effect = exceptions.GoogleAPIError("Vertex AI API error")
```

**Change To:**
```python
def test_ai_generation_failure_pipeline(self, full_pipeline_mocks):
    """Test: Pipeline handles AI generation failures gracefully"""
    mocks = full_pipeline_mocks

    # AI generation fails
    mocks["langchain"].generate_sql.side_effect = Exception("AI generation failed")
```

**Why:**
- Removes Google Cloud dependency
- Tests same error handling path
- Uses standard Python exception

---

### File 2: `backend/tests/services/test_query_service.py`

**Location:** Lines 256-272

**Current:**
```python
def test_execute_query_ai_generation_fails(
    self,
    query_service,
    mock_langchain_service
):
    """Test handling of AI generation failure"""
    from google.api_core import exceptions

    mock_langchain_service.generate_sql.side_effect = exceptions.GoogleAPIError("API Error")
```

**Change To:**
```python
def test_execute_query_ai_generation_fails(
    self,
    query_service,
    mock_langchain_service
):
    """Test handling of AI generation failure"""
    mock_langchain_service.generate_sql.side_effect = Exception("AI generation failed")
```

**Why:**
- Removes Google Cloud dependency
- Tests same error handling path
- Uses standard Python exception

---

## Verification Steps

After making changes, run these commands:

```bash
# Test 1: Run end-to-end pipeline tests
cd C:\Users\chris\myTribe-Development\mytribe-ai-research-platform\backend
pytest tests/integration/test_end_to_end_pipeline.py::TestEndToEndQueryPipeline::test_ai_generation_failure_pipeline -v

# Test 2: Run query service tests
pytest tests/services/test_query_service.py::TestQueryService::test_execute_query_ai_generation_fails -v

# Test 3: Run all tests to ensure no breakage
pytest tests/ -v
```

**Expected Result:** All tests PASS ✓

---

## Post-Removal Verification

### Step 1: Verify No Google Cloud Imports Remain

```bash
grep -r "from google" C:\Users\chris\myTribe-Development\mytribe-ai-research-platform\backend\app --include="*.py"
```

**Expected:** No results (0 matches)

### Step 2: Verify No GCP References in Active Code

```bash
grep -r "google\|vertex\|GoogleCloud" C:\Users\chris\myTribe-Development\mytribe-ai-research-platform\backend\app --include="*.py" | grep -v "Google Docs"
```

**Expected:** No results (0 matches) - Only "Google Docs" references are acceptable

### Step 3: Check Dependencies Still Work

```bash
pip list | grep -i google
```

**Expected:** May show google packages from transitive dependencies (e.g., from anthropic), but none should be direct dependencies

---

## Files Already Clean

These files have **NO Google Cloud dependencies**:

- ✓ `backend/tests/conftest.py` (explicitly removed GCP_PROJECT_ID)
- ✓ `backend/app/main.py` (no GCP imports)
- ✓ `backend/app/config.py` (no GCP config)
- ✓ `backend/app/services/query_service.py` (uses Claude API)
- ✓ `backend/app/ai/langchain_service.py` (Claude-based)
- ✓ `backend/app/ai/claude_service.py` (no GCP)
- ✓ `requirements.txt` (all GCP packages already commented out)

---

## Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Review this plan | 2 min | Ready |
| 2 | Modify test file 1 | 2 min | Ready |
| 3 | Modify test file 2 | 2 min | Ready |
| 4 | Run verification tests | 2 min | Ready |
| 5 | Commit changes | 2 min | Ready |

**Total Estimated Time:** ~10 minutes

---

## Rollback Plan (If Needed)

If tests fail after changes:

1. **Revert files:** `git checkout backend/tests/`
2. **Investigate:** Check test output for errors
3. **Report:** Document any unexpected failures

**Confidence Level:** 99% - Changes are isolated and test the same code paths

---

## Notes

- These tests are NOT currently broken
- This is a **cleanup operation**, not a bug fix
- No application functionality changes
- No database schema changes
- No API contract changes

---

**Ready to proceed with removal? Confirm and execute changes above.**
