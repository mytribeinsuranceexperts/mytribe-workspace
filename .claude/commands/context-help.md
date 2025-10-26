# Context Management Guide

## Commands

### Monitor Token Usage
```bash
/context
```
**Shows:** Loaded files, token count, MCP calls, conversation history

**Use when:**
- Checking how much context is being used
- Identifying which files are loaded
- Debugging why Claude seems "slow"

---

### Summarize & Reset
```bash
/compact
```
**What it does:**
- Summarizes current conversation
- Starts fresh with summary
- Preserves key information

**When to use:**
- Context exceeds 50k tokens
- Long conversation getting unwieldy
- Need to continue but want cleaner slate

**Warning:** Claude may "forget" some details. Re-introduce critical context if needed.

---

### Complete Reset
```bash
/clear
```
**What it does:**
- Complete wipe of conversation
- Fresh start, no history

**When to use:**
- Switching between unrelated tasks
- Starting completely different feature
- After completing major milestone
- Responses become off-track or repetitive

---

## Focus on Specific Files

```bash
@filename
```
**Supports:** Tab-completion for quick file selection

**Benefits:**
- Avoids context pollution from irrelevant code
- Keeps conversations focused on current task
- Claude reads only what you specify

---

## Signs Context Needs Reset

- ❌ Responses reference old, unrelated discussions
- ❌ Repeating information from hours ago
- ❌ Mixing up different features/files
- ❌ Slower or less accurate responses

**Action:** Use `/compact` (preserves some context) or `/clear` (full reset)

---

## Best Practices

✅ **One focused conversation per task**

✅ **Use `/compact` strategically** when hitting 50k+ tokens

✅ **Use `/clear` between major context switches**

✅ **Use `@filename`** to avoid loading entire codebase

✅ **Monitor with `/context`** periodically

---

**Related:** [CLAUDE.md Context Management section](../../CLAUDE.md#-context-management)
