# AI Code Review

**Automated code review with specialized expertise**

---

## Task

Review recent code changes using AI with code verification expertise.

---

## Instructions

### Step 1: Load Code Verifier Role

```
Load roles/code-verifier.md for specialized code review expertise
```

**Why:** Provides structured review framework and best practices

---

### Step 2: Get Recent Changes

```bash
# Show recent commits
git log --oneline -5

# Show unstaged changes
git diff

# Show staged changes
git diff --staged

# Show last commit
git diff HEAD~1
```

**Review:** Changes since last commit or staging area

---

### Step 3: Analyze Code

**Review focus areas:**

1. **Security**
   - SQL injection vulnerabilities
   - XSS risks
   - Auth bypass potential
   - Secret exposure
   - Input validation

2. **Performance**
   - Inefficient loops
   - Unnecessary operations
   - Memory leaks
   - N+1 queries
   - Blocking operations

3. **Readability**
   - Clear variable names
   - Function size (< 50 lines ideal)
   - Comments for complex logic
   - Consistent style
   - DRY principle

4. **Test Coverage**
   - Tests for new features
   - Edge cases covered
   - Error conditions tested
   - Happy path tested
   - Integration tests if needed

5. **Edge Cases**
   - Null/undefined handling
   - Empty arrays/strings
   - Boundary values
   - Error conditions
   - Race conditions

6. **Best Practices**
   - Follows project conventions
   - Proper error handling
   - Async/await usage
   - Resource cleanup
   - Logging appropriate

---

### Step 4: Generate Review Report

**Format: Actionable checklist**

```markdown
## Code Review Summary

### Critical Issues ⚠️
- [ ] [Issue 1 with file:line reference]
- [ ] [Issue 2 with file:line reference]

### High Priority
- [ ] [Issue 3]
- [ ] [Issue 4]

### Medium Priority
- [ ] [Issue 5]
- [ ] [Issue 6]

### Low Priority / Suggestions
- [ ] [Suggestion 1]
- [ ] [Suggestion 2]

### Positive Observations ✅
- [Good practice 1]
- [Good practice 2]

### Recommendations
1. [Overall recommendation]
2. [Overall recommendation]
```

---

### Step 5: Verify Critical Items

**For each critical/high priority issue:**

1. Explain the problem clearly
2. Show the problematic code
3. Propose specific fix
4. Explain why fix improves code

**Example:**
```
Issue: SQL injection vulnerability in auth.js:45

Current code:
const query = `SELECT * FROM users WHERE id = ${userId}`;

Problem: User-supplied userId concatenated directly into SQL

Fix:
const query = `SELECT * FROM users WHERE id = ?`;
db.execute(query, [userId]);

Why: Parameterized query prevents SQL injection
```

---

### Step 6: Check Test Coverage

```bash
# Run tests with coverage
[project-specific command]

# Example: JavaScript
npm run test:coverage

# Example: Python
pytest --cov=app --cov-report=term
```

**Verify:**
- [ ] New code has tests
- [ ] Coverage remains > 90%
- [ ] Tests actually test behavior (not implementation)

---

### Step 7: Run Quality Checks

```bash
# Linting
[project-specific lint command]

# Formatting
[project-specific format command]

# Type checking (if applicable)
[project-specific type check command]
```

**Fix any issues found**

---

## Review Checklist

**Before approving changes:**

### Security
- [ ] No hardcoded secrets or API keys
- [ ] All user inputs validated
- [ ] SQL queries parameterized
- [ ] HTML outputs sanitized
- [ ] Auth checks in place

### Testing
- [ ] New features have tests
- [ ] Tests cover edge cases
- [ ] Tests cover error conditions
- [ ] All tests pass locally
- [ ] Coverage target met (90%+)

### Code Quality
- [ ] Follows project conventions
- [ ] Functions < 50 lines
- [ ] Clear variable names
- [ ] Complex logic commented
- [ ] No obvious performance issues

### Documentation
- [ ] README updated if needed
- [ ] CHANGELOG updated for user-facing changes
- [ ] Code comments for complex logic
- [ ] API docs updated if applicable

### Standards
- [ ] Conventional commit message
- [ ] Branch name follows convention
- [ ] No merge conflicts
- [ ] Linting passes
- [ ] Formatting consistent

---

## Quick Review Prompts

### Minimal Review (Quick Check)
```
Review my last commit for obvious issues:
- Security vulnerabilities
- Breaking changes
- Missing tests
- Style violations

Report as brief checklist.
```

### Standard Review (Recommended)
```
Load roles/code-verifier.md

Review my git changes comprehensively:
- Security (SQL injection, XSS, auth, secrets)
- Performance (efficiency, bottlenecks)
- Readability (naming, structure, comments)
- Tests (coverage, edge cases)
- Best practices (error handling, async)

Report as prioritized checklist with file:line references.
```

### Deep Review (Critical Code)
```
Load roles/security-eng.md and roles/code-verifier.md

Deep review of [file/component]:
- Full security audit
- Threat modeling
- Performance analysis
- Edge case identification
- Architectural concerns

Report as detailed analysis with specific recommendations.
```

### Pre-Deployment Review
```
Load workflows/deployment-checklist.md
Load roles/code-verifier.md

Pre-deployment review for [staging/production]:
- All checks from deployment checklist
- Code quality verification
- Security audit
- Test coverage confirmation
- Documentation completeness

Report go/no-go decision with reasoning.
```

---

## Example Review Session

**Prompt:**
```
Load roles/code-verifier.md

I've added a new authentication endpoint to auth.js.
Review the changes:

git diff auth.js

Check for:
- SQL injection
- Password handling
- Session management
- Input validation
- Error handling
- Tests included

Report as actionable checklist.
```

**Expected Output:**
- Critical issues found (if any)
- Priority fixes needed
- Positive observations
- Actionable recommendations

---

## After Review

### If Issues Found

```bash
# Fix issues
[make corrections]

# Re-run tests
[test command]

# Re-run quality checks
[lint/format commands]

# Request another review if needed
/ai-review
```

### If Review Passes

```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "[type]: [description]"

# Push (with approval)
git push
```

---

## Tips

1. **Review early** - Don't wait until code is "done"
2. **Small reviews** - Easier to spot issues in small changesets
3. **Multiple passes** - Quick pass first, deep dive on concerns
4. **Learn patterns** - Note common issues, avoid in future
5. **Trust but verify** - AI may miss things, manual review critical code

---

**Last Updated:** 2025-10-16