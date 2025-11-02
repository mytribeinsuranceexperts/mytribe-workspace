# Universal Development Workflow

For ALL non-trivial development tasks, follow this workflow in order:

## 1. EXPLORE (Gather Context)
- Read relevant files - don't guess, read actual code
- Use Grep/Glob to find related code
- Review existing tests and documentation
- **NEVER search or read files in `archive/` or `**/archive/` directories** - contains outdated docs
- Output: "I've reviewed X, Y, Z files and understand..."
- ⚠️ **DO NOT write code yet**

## 2. PLAN (Think Before Coding)
- Outline solution step-by-step in plain language
- Identify edge cases and potential issues
- List files to change and why
- Estimate complexity: Simple, moderate, or complex
- Get approval: Wait for human confirmation before proceeding
- ⚠️ **DO NOT skip this step**

## 3. CODE (Implement with Verification)
- Write tests first when applicable (TDD - see `/tdd-guide`)
- Implement incrementally - not all at once
- Run tests after each major change
- Verify approach as you go
- Self-review: Check your own code for issues
- Run quality checks: linting, formatting, tests

## 4. COMMIT (Document Changes)
- Use conventional commits format: `type: description`
  - Types: feat, fix, docs, chore, refactor, test, security
- Update CHANGELOG.md for user-facing changes
- DO NOT push to remote without explicit approval

---

**Related Commands:**
- `/tdd-guide` - Test-driven development workflow
- `/commit-guide` - Detailed commit creation steps
- `/create-pr` - Pull request creation process
