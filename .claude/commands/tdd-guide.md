# Test-Driven Development (TDD) Guide

## When to Use TDD

Use TDD for:
- ✅ New features with clear requirements
- ✅ Bug fixes (write test that reproduces bug, then fix)
- ✅ Critical business logic (calculations, security, auth)
- ✅ Complex algorithms

## TDD Workflow

1. **Write Failing Test** - Define expected behavior
2. **Run Tests** - Confirm failure
3. **Implement Minimum Code** - Make test pass
4. **Run Tests** - Confirm success
5. **Refactor** - Keep tests green

## Example: Bug Fix with TDD

```bash
# 1. Write test that reproduces bug
# Add test to tests/bugfix.test.js

# 2. Run test - it should fail
npm test

# 3. Fix the bug
# Edit src/component.js

# 4. Run test - it should pass
npm test

# 5. Refactor if needed, keeping tests green
npm test
```

## Benefits

- Catches bugs early
- Forces you to think about edge cases
- Provides documentation through tests
- Makes refactoring safer
- Reduces debugging time

## When NOT to Use TDD

- Quick prototypes or spikes
- UI/UX experimentation
- When requirements are unclear
- Simple CRUD operations with established patterns

---

📖 **Full Details:** [development-wiki/workflows/testing-strategy.md](../../development-wiki/workflows/testing-strategy.md)
