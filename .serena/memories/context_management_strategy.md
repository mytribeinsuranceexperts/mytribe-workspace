# Context Management Strategy

## Proactive Session Management (Before 25% Remaining)

**Monitor context after each major task completion.** When approaching ~50k tokens (25% of 200k limit), prepare for handoff BEFORE auto-compaction triggers.

### Pre-Handoff Checklist

1. **Archive unnecessary docs**
   - Move completed/outdated docs to archive/
   - Remove temporary reasoning files
   - Keep only active progress trackers

2. **Update all active docs**
   - Edit existing docs (never create new unless essential)
   - Update progress trackers with current status
   - Mark completed tasks, note blockers/deviations
   - Keep docs concise (avoid lengthy files that consume tokens)

3. **Prepare handoff prompt**
   - Summarize: What was accomplished
   - Document: Current state, next steps
   - Note: Any blockers, decisions made, context needed
   - Format: Clear, concise prompt for next session

### When to Trigger Handoff

**User signals:**
- "Let's get ready for a new session"
- "Prepare for handoff"
- "We're running low on context"

**AI signals:**
- Context usage >150k tokens (~75% used)
- Major milestone completed with more work ahead
- Complex task requiring fresh context

### Handoff Process

1. Stop current work gracefully
2. Execute Pre-Handoff Checklist
3. Provide user with:
   - Summary of session accomplishments
   - Current state of all repos/features
   - Continuation prompt for next session
   - List of updated/archived docs

## Auto-Compaction Avoidance

**Goal:** Never hit auto-compaction (~50k tokens remaining)

**Strategy:**
- Tick off tasks incrementally
- Check context after each subtask
- Proactively prepare handoff at 75% usage
- Favor editing over creating docs
- Keep all docs token-efficient

## Token-Efficient Documentation

**Principles:**
- ✅ Edit existing docs (update in place)
- ❌ Create new docs (requires explicit permission)
- ✅ Concise bullet points
- ❌ Lengthy narratives
- ✅ Remove completed reasoning
- ❌ Append indefinitely
- ✅ Archive obsolete content
- ❌ Leave scattered temporary files