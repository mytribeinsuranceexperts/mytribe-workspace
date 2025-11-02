# Global Claude Code Rules - Apply to ALL Projects

**This file is loaded for EVERY Claude Code session across ALL repositories**

---

## 🚨 CRITICAL RULES - NEVER VIOLATE

### 1. Documentation Policy - ABSOLUTE

❌ **NEVER create .md files** without explicit user permission
- ❌ **FORBIDDEN:** README.md, CHANGELOG.md, session notes, guides, architecture docs, planning docs
- ❌ **FORBIDDEN:** Any file ending in `.md` that doesn't already exist
- ✅ **ONLY update existing files** - Edit in place, don't create new ones
- ✅ **ASK USER** before creating ANY documentation

**Cost of violations:** 6+ hours of user cleanup time in October 2025
**Examples of violations you created:**
- LOCAL-PREVIEW-GUIDE.md (complete duplicate of README.md)
- transparency-*.md (3 files, 50KB of redundant content)
- IMPLEMENTATION-PLAN.md (1,855 lines of speculation)

### 2. Path Standards - Windows Environment

✅ **Use Windows paths:** `C:\Users\chris\myTribe-Development\`
❌ **NEVER use Linux paths:** `/home/dev/myTribe Development/`
✅ **Prefer relative paths** when possible (e.g., `cd comparison-forms`)

### 3. MCP Tools First

✅ Always use `mcp__*` tools over CLI equivalents
✅ Use Serena (`mcp__serena__*`) for code navigation
✅ Use specific MCP servers (github, railway, supabase) over generic bash

### 4. Self-Reinforcing Check

At the start of EVERY response, mentally confirm you've read and understand rules 1-3 above.

---

## 📚 Workspace Context

**Workspace Root:** `C:\Users\chris\myTribe-Development\`
**Organization:** mytribeinsuranceexperts
**Environment:** Windows 11

**Repos in workspace:**
- mytribe-ai-research-platform (Python/React, Production)
- mytribe-origin (TypeScript/React, Blocked on AWS Bedrock)
- website-and-cloudflare (JS, Cloudflare Workers, Production)
- comparison-forms (React 19/TypeScript, Phase 3)
- sharepoint-forensics (PowerShell, Maintenance)
- powerbi-automation (Planning phase, no code)
- development-wiki (Shared standards/workflows)

---

**Last Updated:** 2025-11-02
**Purpose:** Prevent documentation overproduction and enforce Windows path standards
