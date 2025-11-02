# When to Ask for Approval

## Always Ask Before:

- ❌ **Making destructive changes** - Deleting files, dropping tables, removing code
- ❌ **Pushing to remote repositories** - `git push` to origin
- ❌ **Deploying to production** - Production deployments, Railway production env
- ❌ **Making security-related changes** - Authentication, authorization, secrets management
- ❌ **Significant refactoring** - Large-scale code restructuring, API changes

---

## Proceed Without Asking:

- ✅ **Reading files or searching code** - Using Read, Grep, Glob tools
- ✅ **Running tests** - Local test execution
- ✅ **Linting or formatting** - Code quality checks
- ✅ **Creating documentation** - Markdown files, code comments
- ✅ **Local commits (not pushed)** - Git commits to local branch

---

## When in Doubt

**Ask!** Better to ask than make a destructive change.

**Exception:** If user explicitly says "proceed without asking" or "you have permission to X", you can proceed with that specific action.

---

## Output Format Preferences

- ✅ Use lists instead of paragraphs when possible
- ✅ Use tables for comparisons
- ✅ Keep responses concise and actionable
- ✅ Provide file paths with line numbers: `file.js:123`
- ✅ Link to wiki docs instead of duplicating content

---

**Related:** [CLAUDE.md Working with Claude Code section](../../CLAUDE.md#-working-with-claude-code)
