# myTribe Development Workspace - Claude Code Context

**Global preferences for all repos in workspace**

## 🎯 Core Rules

1. **MCP Tools First** - Always use MCP tools (`mcp__*`) over CLI when available
2. **Latest Dependencies** - Use current stable versions, note breaking changes
3. **Communication** - Concise, bulleted, factual. No emojis unless requested
4. **Documentation Policy - STRICT**
   - ✅ Update existing docs only
   - ❌ NEVER create new .md files without explicit permission
   - ✅ Remove completed reasoning, keep progress/deviations
   - ✅ Clean as you go (don't append)
5. **Memory** - Use `#` to add here, `/memory` to edit directly

---

## 📁 Workspace Structure

**Multi-repo workspace:** Each repo has own git, deploys independently

```
myTribe-Development/
├── development-wiki/          # Shared standards, workflows
├── mytribe-ai-research-platform/  # Python, React, PostgreSQL/Railway
├── mytribe-origin/            # Original platform (legacy)
├── website-and-cloudflare/    # JS, Cloudflare Workers
├── comparison-forms/          # React 19, TypeScript, Vite
├── sharepoint-forensics/      # PowerShell automation
├── powerbi-automation/        # Python, Power BI
└── docs/                      # Architecture docs
```

**Shared Resources:**
- **Agents:** `.claude/agents/` - Specialized AI assistants
- **Workflows:** `development-wiki/workflows/` - Standard processes
- **Standards:** `development-wiki/standards/` - Code quality conventions

📖 [Development Wiki README](development-wiki/README.md)

---

## 🔄 Development Workflow

**EXPLORE → PLAN → CODE → COMMIT**

- **EXPLORE:** Read code, search, review tests (no coding)
- **PLAN:** Design solution, identify edge cases, get approval
- **CODE:** TDD when applicable, incremental implementation
- **COMMIT:** Conventional format (`type: description`)

📖 Commands: `/workflow` `/tdd-guide` `/commit-guide`

---

## 🔐 Security Rules

1. Never commit secrets (use `.env` outside repos)
2. Validate all inputs
3. Handle errors without exposing sensitive data
4. Threat model before implementing
5. Write security tests (XSS, injection, auth bypass)

📖 [Security Practices](development-wiki/standards/security-practices.md)

---

## 📝 Commit Format

`<type>: <description>` e.g. `feat: add login page`

**Types:** feat, fix, docs, style, refactor, test, chore, security

📖 `/commit-guide` | [Full Guide](development-wiki/standards/commit-conventions.md)

---

## 🤖 Specialized Agents

**Location:** `.claude/agents/` (15 agents available)

**When user mentions keywords, ask if they want to load agent:**

| Keywords | Agent |
|----------|-------|
| docker, container | docker-specialist.md |
| railway, deploy | *(built-in, no agent)* |
| database, postgres, sql | database-expert.md |
| debug, error, logs | debugging-specialist.md |
| performance, slow, optimize | performance-engineer.md |
| refactor, complexity | refactoring-specialist.md |
| test, e2e, integration | test-automation-expert.md |
| security, xss, injection | infrastructure-security.md |
| api, endpoint, rest | api-designer.md |
| accessible, wcag, a11y | accessibility-specialist.md |
| css, webflow, responsive | css-ui-specialist.md |
| powershell, sharepoint | powershell-specialist.md |
| python, fastapi, async | python-specialist.md |
| seo, meta tags, schema | seo-specialist.md |
| coordinate, multi-step | workflow-orchestrator.md |

**Manual loading:** User can request `.claude/agents/<name>.md` directly

📖 [Agent Directory](.claude/agents/README.md)

---

## 📚 Quick Reference

**Most Used:**
- [Git Workflow](development-wiki/workflows/git-workflow.md)
- [Testing Strategy](development-wiki/workflows/testing-strategy.md)
- [Code Quality](development-wiki/standards/code-quality.md)
- [Deployment Checklist](development-wiki/workflows/deployment-checklist.md)

**Project Context:** Each repo has `CLAUDE.md` with project-specific details

**Hierarchy:** Workspace CLAUDE.md (global) → Project CLAUDE.md → Subdirectory CLAUDE.md

---

## 🎯 Key Principles

1. Read → Plan → Code → Test
2. Security first
3. Update existing docs (never create without permission)
4. Ask when unsure
5. Use latest dependencies
6. Keep it concise

---

## ⛔ Forbidden Directories

**NEVER read/search:**
- `archive/`, `node_modules/`, `.git/`, `.vscode/extensions/`
- `.claude/file-history/`, `.claude/todos/`, `.claude/projects/`
- `.claude/shell-snapshots/`, `.claude/downloads/`

**Why:** Saves tokens, prevents outdated info

---

## ⚙️ Auto-Formatters

**On save:** ESLint → Organize Imports → Prettier → Trim Whitespace → Final Newline

**Python:** Black, Flake8, isort (auto-format on save)

**What this means:**
- ✅ Focus on logic, not formatting
- ❌ Don't manually format or suggest running formatters

📖 Each repo: `.vscode/settings.json`

---

## 🧠 Extended Reasoning

- **"think"** → ~4k tokens (routine bugs)
- **"think hard"** → ~10k tokens (API integrations)
- **"think harder"** → ~32k tokens (migrations, architecture)

**Use for:** Architecture, complex refactoring, threat modeling, performance optimization

**Cost:** More tokens; use strategically

---

## 🗂️ Context Management

- **Monitor:** `/context` (shows files, tokens, MCP calls)
- **Compact:** `/compact` (when >50k tokens)
- **Reset:** `/clear` (between unrelated tasks)
- **Focus:** `@filename` (tab-completion)

**Signs to reset:** Referencing old discussions, mixing up features, slower responses

---

## ⚠️ AI Limitations

**Don't use AI for:**
- Sequential dependent operations (do manually)
- Deep domain regulations (insurance compliance needs review)
- Security blind trust (manually review SQL, auth, crypto)
- Critical decisions (production deploy, data deletion)

**Hallucinations:** May invent functions/APIs. Always verify: run code, check docs, test.

**Best practice:** AI drafts, you verify and approve

---

## 💡 Commands

- `#` - Add to memory
- `/memory` - Edit this file
- `/workflow`, `/commit-guide`, `/tdd-guide`
- `/context-help`, `/approval-guide`

---

## 📞 Environment

**Workspace:** `C:\Users\chris\mytribe-development`

**GitHub:** Org: `mytribeinsuranceexperts` | Primary repo: `mytribe-workspace`
Default to this org for GitHub operations.

**MCP Auth:**
- Command-based servers: Environment variables
- HTTP servers (Supabase, Cloudflare): `.mcp.json` (gitignored)

📖 See `security.md` for details. Restart Claude Code after credential changes.

---

## 🎓 Remember

**Hierarchical memory:**
1. This file (workspace) - Global preferences
2. Project CLAUDE.md - Project-specific details
3. Subdirectory CLAUDE.md - Most specific context

**Keep focused:** Don't duplicate, link to shared docs, update appropriate level

---

**Last Updated:** 2025-10-27 | **Team:** myTribe Insurance Experts

<!-- End of CLAUDE.md -->
