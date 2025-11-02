# myTribe Development Workspace - Claude Code Context

**Global preferences for all repos in workspace**

## 🎯 Core Rules - DISPLAY AT START OF EVERY RESPONSE

**Why these rules exist:** You have violated documentation policies 18+ times this month, creating unnecessary files, ignoring path standards, and duplicating content. These rules are ABSOLUTE.

1. **MCP Tools First** - Always use MCP tools (`mcp__*`) over CLI when available
   - **Serena (`mcp__serena__*`)** - Semantic code navigation; use for exploring/editing code instead of reading entire files
   - **Available MCP Servers:** supabase, github, railway, filesystem, memory, serena, cloudflare-docs, time, aws-bedrock-agentcore, antv-chart
   - Use MCP versions over CLI when available

2. **Latest Dependencies** - Use current stable versions, note breaking changes

3. **Communication** - Concise, bulleted, factual. No emojis unless requested

4. **Documentation Policy - ABSOLUTELY FORBIDDEN TO VIOLATE**
   - ❌ **NEVER create .md files** (README, CHANGELOG, guides, session notes, architecture docs)
   - ✅ **ONLY update existing files** - Edit in place, don't append
   - ✅ **ASK USER** before creating ANY documentation
   - ✅ **After session:** Archive session notes to `archive/YYYY-MM-DD/`
   - ✅ **Remove completed reasoning** - Keep progress/deviations only
   - ✅ **Clean as you go** - Don't append duplicate content

   **Cost of violations:** 6+ hours of user cleanup time this month
   **Examples of violations:** LOCAL-PREVIEW-GUIDE.md (duplicate), transparency-*.md (3 files, 50KB), IMPLEMENTATION-PLAN.md (1,855 lines)

5. **Path Standards - Windows Environment**
   - ✅ Use `C:\Users\chris\myTribe-Development\` for absolute paths
   - ❌ NEVER use Linux paths (`/home/dev/myTribe Development/`)
   - ✅ Prefer relative paths when possible (`cd comparison-forms`)

6. **Memory** - Use `#` to add here, `/memory` to edit directly

7. **Self-Check** - At the start of every response, confirm you've read rules 1-6 above

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

## 🧹 Clean Code Principles

1. **DRY (Don't Repeat Yourself)** - Extract reusable logic; use "Three Strikes Rule" (duplicate once OK, third time refactor)
2. **Single Responsibility** - Each function/class/module has ONE reason to change
3. **Intention-Revealing Names** - Variables are nouns, functions are verbs; names answer "why, what, how"
4. **Small & Focused Functions** - Max 50 lines; one responsibility; extract helpers
5. **Loose Coupling, High Cohesion** - Modules independent with minimal dependencies; related functionality grouped together

📖 [Code Quality Standards](development-wiki/standards/code-quality.md)

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

**Location:** `.claude/agents/` (19 agents available)

**When user mentions keywords, ask if they want to load agent:**

| Keywords                           | Agent                         |
| ---------------------------------- | ----------------------------- |
| docker, container                  | docker-specialist.md          |
| railway, deploy                    | _(built-in, no agent)_        |
| database, postgres, sql            | database-expert.md            |
| debug, error, logs                 | debugging-specialist.md       |
| performance, slow, optimize        | performance-engineer.md       |
| refactor, complexity               | refactoring-specialist.md     |
| test, e2e, integration             | test-automation-expert.md     |
| security, xss, injection           | infrastructure-security.md    |
| api, endpoint, rest                | api-designer.md               |
| accessible, wcag, a11y             | accessibility-specialist.md   |
| css, webflow, responsive           | css-ui-specialist.md          |
| powershell, sharepoint             | powershell-specialist.md      |
| python, fastapi, async             | python-specialist.md          |
| seo, meta tags, schema             | seo-specialist.md             |
| coordinate, multi-step             | workflow-orchestrator.md      |
| data pipeline, etl, transformation | data-engineer.md              |
| llm, ai integration, prompts       | llm-integration-specialist.md |
| mcp, tool server, claude desktop   | mcp-architect.md              |
| verify data, validation, quality   | data-verifier.md              |
| research, search, information      | web-researcher.md             |

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

## 🔌 MCP Servers

**11 Available MCP Servers:**

**Development & Infrastructure:**

- **supabase** - Database management, auth, storage operations
- **github** - Repository operations, PR/issue management, workflows
- **railway** - Deployment, service management, logs, environment variables
- **cloudflare-docs** - Documentation search and reference

**Code Intelligence:**

- **serena** - Semantic code navigation, intelligent editing, codebase exploration
- **filesystem** - File operations with enhanced permissions
- **memory** - Persistent memory across sessions

**Testing & Automation:**

- **playwright** - Browser automation, E2E testing, screenshots

**Data & AI:**

- **aws-bedrock-agentcore** - AWS Bedrock agent integration
- **antv-chart** - Data visualization and chart generation

**Utilities:**

- **time** - Date/time operations, scheduling

**Usage Priority:**

1. Always prefer MCP tools over CLI equivalents
2. Use Serena for code exploration instead of reading entire files
3. Use specific MCP servers (github, railway, supabase) over generic CLI commands

---

## 🎓 Remember

**Hierarchical memory:**

1. This file (workspace) - Global preferences
2. Project CLAUDE.md - Project-specific details
3. Subdirectory CLAUDE.md - Most specific context

**Keep focused:** Don't duplicate, link to shared docs, update appropriate level

---

**Last Updated:** 2025-11-02 | **Team:** myTribe Insurance Experts

<!-- End of CLAUDE.md -->
