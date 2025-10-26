# myTribe Development Workspace - Claude Code Global Context

**Workspace-Level Memory for AI Assistance**

This file provides Claude Code with global context and preferences that apply across all repositories in the myTribe Development workspace.

---

## 🎯 Core Development Preferences

### Always Follow These Guidelines

1. **MCP Tools Priority**
   - **ALWAYS prefer MCP tools over CLI commands** when both are available
   - MCP tools are prefixed with `mcp__` (e.g., `mcp__github_*`)
   - Only fall back to CLI if MCP tool doesn't exist or fails
   - Example: Use GitHub MCP instead of `gh` CLI for GitHub operations

2. **Latest Dependencies**
   - When suggesting packages or dependencies, always use the latest stable versions
   - Check for current versions rather than suggesting older packages
   - Mention if breaking changes exist between versions

3. **Communication Style**
   - Keep responses concise but factual - include important details, cut unnecessary explanation
   - Favor bulleted lists over long paragraphs
   - Use tables for comparisons and structured data
   - Avoid unnecessary emojis unless explicitly requested
   - In documentation: Remove completed reasoning, keep progress and deviations

4. **Documentation Organization**
   - **ALWAYS update existing docs** rather than creating new ones
   - Only create new documentation files when explicitly requested
   - Reference existing wiki docs rather than duplicating content
   - **Maintain living documents:** As work progresses, update relevant sections, remove completed reasoning, log progress and deviations from original plan
   - **Clean as you go:** Remove outdated information when updating files - don't just append to the bottom

5. **Memory Management**
   - Use `#` at start of message to quickly add to this memory file
   - Use `/memory` command to edit this file directly
   - Keep this file focused - don't bloat with hundreds of rules

6. **Documentation Policy - Living Documents**

   **Core principle:** Documentation should evolve with the project, not accumulate.

   **When updating documentation:**
   - ✅ Update the relevant section in existing docs (don't append to bottom)
   - ✅ Remove reasoning and context once task is completed
   - ✅ Log progress and any deviations from original plan
   - ✅ Delete or archive outdated information as you work
   - ✅ Keep information factual and concise

   **NEVER create:**
   - ❌ Post-task summary documents
   - ❌ Separate plan completion reports
   - ❌ Duplicate documentation in new files

   **ONLY create new files when:**
   - User explicitly requests: "Create a document for X"
   - No existing document covers this topic

---

## 📁 Workspace Structure

### Repository Organization

This workspace contains multiple repositories with shared standards:

```
myTribe Development/
├── development-wiki/          # Single source of truth for shared standards
├── website-and-cloudflare/    # JavaScript, Cloudflare Workers
├── mytribe-ai-research-platform/  # Python, React, PostgreSQL/Railway
├── comparison-forms/          # React 19, TypeScript, Vite
├── sharepoint-forensics/      # PowerShell
├── powerbi-automation/        # Python
└── CLAUDE.md                  # This file
```

### Shared Resources Location

**IMPORTANT:** All shared documentation is centralized in the Development Wiki to avoid duplication.

- **Roles:** `development-wiki/roles/` - AI agent roles for specialized tasks
  - doc-expert, senior-dev, qa-engineer, security-eng, devops, data-ml, etc.
- **Workflows:** `development-wiki/workflows/` - Standard processes
  - git-workflow.md, testing-strategy.md, deployment-checklist.md, version-bumping.md
- **Standards:** `development-wiki/standards/` - Code quality & conventions
  - code-quality.md, commit-conventions.md, security-practices.md, documentation-standards.md

📖 **See [development-wiki/README.md](development-wiki/README.md) for complete shared documentation**

---

## 🔄 Universal Development Workflow

**For ALL non-trivial tasks:** EXPLORE → PLAN → CODE → COMMIT

📖 **Full Details:** Use `/workflow` command for complete step-by-step guide

**Quick Reference:**
- **EXPLORE:** Read code, use Grep/Glob, review tests - don't write code yet
- **PLAN:** Outline solution, identify edge cases, get approval - don't skip this
- **CODE:** TDD when applicable, implement incrementally, run tests
- **COMMIT:** Conventional commits (`type: description`), update CHANGELOG

**Related Commands:**
- `/workflow` - Full development workflow
- `/tdd-guide` - Test-driven development
- `/commit-guide` - Git commit standards

---

## 🔐 Security-First Mindset

### Critical Rules (Apply to ALL Repos)

1. **Never commit secrets** - API keys, passwords, tokens, credentials
2. **Use environment variables** - Store secrets in `.env` files (outside repos)
3. **Validate all inputs** - Never trust user input
4. **Handle errors properly** - Don't expose sensitive info in error messages
5. **Review security implications** - Consider what could go wrong before implementing

### Before Implementing ANY Feature

1. Threat model - What could go wrong?
2. Write security tests - XSS, injection, auth bypass
3. Implement with security in mind - Input validation, output encoding
4. Peer review - Use `development-wiki/roles/security-eng.md`

📖 **See [development-wiki/standards/security-practices.md](development-wiki/standards/security-practices.md)**

---

## 📝 Commit Message Standards

**Format:** `<type>: <description>` (e.g., `feat: add login page`)

**Types:** feat, fix, docs, style, refactor, test, chore, security

📖 **Full Guide:** Use `/commit-guide` command or see [development-wiki/standards/commit-conventions.md](development-wiki/standards/commit-conventions.md)

---

## 🤖 Specialized Agents & Keyword Triggers

### Agent Auto-Detection

When user mentions these keywords, **ask if they want to load the corresponding agent:**

**Infrastructure & Deployment:**
- `docker`, `dockerfile`, `container` → Load `.claude/agents/docker-specialist.md`
- `railway`, `deployment`, `deploy` → Load `.claude/agents/devops.md`
- `database`, `postgres`, `sql`, `query` → Load `.claude/agents/database-expert.md`
- `cloudflare`, `wrangler`, `worker` → *(No agent - direct help)*

**Code Quality & Testing:**
- `debug`, `error`, `failing`, `logs` → Load `.claude/agents/debugging-specialist.md`
- `slow`, `performance`, `optimize` → Load `.claude/agents/performance-engineer.md`
- `refactor`, `complexity`, `cleanup` → Load `.claude/agents/refactoring-specialist.md`
- `test`, `testing`, `e2e`, `integration` → Load `.claude/agents/test-automation-expert.md`

**Security & Infrastructure:**
- `security`, `vulnerability`, `xss`, `injection` → Load `development-wiki/roles/security-eng.md`
- `secrets`, `environment`, `iam`, `credentials` → Load `.claude/agents/infrastructure-security.md`

**Specialized:**
- `api`, `endpoint`, `rest` → Load `.claude/agents/api-designer.md`
- `accessible`, `wcag`, `a11y`, `screen reader` → Load `.claude/agents/accessibility-specialist.md`
- `css`, `webflow`, `styling`, `responsive` → Load `.claude/agents/css-ui-specialist.md`
- `powershell`, `sharepoint`, `power bi` → Load `.claude/agents/powershell-specialist.md`
- `python`, `fastapi`, `async` → Load `.claude/agents/python-specialist.md`
- `seo`, `meta tags`, `schema`, `sitemap` → Load `.claude/agents/seo-specialist.md`

**Workflow:**
- `coordinate`, `multi-step`, `complex task` → Load `.claude/agents/workflow-orchestrator.md`

### Manual Agent Loading

User can always explicitly request:
```
"Load .claude/agents/docker-specialist.md and review my Dockerfile"
"Use development-wiki/roles/security-eng.md to audit this code"
```

### Workspace Roles (development-wiki/roles/)

Original 8 roles available for manual loading:
- senior-dev.md, security-eng.md, qa-engineer.md, devops.md
- doc-expert.md, data-ml.md, architecture-reviewer.md, code-verifier.md

---

## 📚 Quick Reference Links

### Most Used Documentation

- [Git Workflow](development-wiki/workflows/git-workflow.md) - Daily git operations
- [Testing Strategy](development-wiki/workflows/testing-strategy.md) - How to write tests
- [Code Quality](development-wiki/standards/code-quality.md) - Linting, formatting
- [Deployment Checklist](development-wiki/workflows/deployment-checklist.md) - Safe deployments
- [Multi-Agent Workflows](development-wiki/workflows/multi-agent-workflows.md) - Parallel tasks

### Project-Specific Context

Each repository has its own CLAUDE.md with project-specific details:

- [website-and-cloudflare/CLAUDE.md](website-and-cloudflare/CLAUDE.md) - JavaScript, Workers
- [mytribe-ai-research-platform/CLAUDE.md](mytribe-ai-research-platform/CLAUDE.md) - Python, React, PostgreSQL/Railway
- [comparison-forms/CLAUDE.md](comparison-forms/CLAUDE.md) - React 19, TypeScript, Vite
- [sharepoint-forensics/CLAUDE.md](sharepoint-forensics/CLAUDE.md) - PowerShell
- [powerbi-automation/CLAUDE.md](powerbi-automation/CLAUDE.md) - Python

**Hierarchical Loading:**
1. This file (workspace-level) - Global rules and preferences
2. Project CLAUDE.md - Project-specific technical details
3. Subdirectory CLAUDE.md (if exists) - Most specific context

---

## 🎯 Key Principles

1. **Read before writing** - Understand existing code before making changes
2. **Plan before coding** - Think through solution before implementation
3. **Test thoroughly** - Write tests, run tests, verify behavior
4. **Security first** - Consider security implications of all changes
5. **Maintain living docs** - Update existing documentation as work progresses, remove completed tasks, log deviations
6. **Ask when unsure** - Better to ask than to guess incorrectly
7. **Use latest tools** - Prefer current versions of dependencies
8. **Keep it concise** - Short notes, lists, interlinked docs

---

## ⛔ Forbidden Directories

**NEVER read or search files in these locations:**
- `archive/` or `**/archive/` - Outdated documentation
- `node_modules/` - Dependencies
- `.vscode/extensions/` - IDE extensions
- `.git/` - Version control internals
- `.claude/file-history/`, `.claude/todos/`, `.claude/projects/` - Claude internals
- `.claude/shell-snapshots/`, `.claude/downloads/` - Temporary files

**Why:** Prevents context pollution, saves tokens, avoids outdated information

---

## ⚙️ Automated Code Quality Tools

### VS Code Extensions & Auto-Fix

**All repositories have automated code quality configured:**

**On Save Pipeline (runs automatically):**
1. **ESLint** - Fixes linting errors
2. **Organize Imports** - Removes unused, sorts alphabetically
3. **Prettier** - Formats code (spacing, quotes, semicolons)
4. **Trim Whitespace** - Removes trailing spaces
5. **Insert Final Newline** - Adds newline at end

**Python Tools (auto-format on save):**
- Black (formatter), Flake8 (linter), isort (import sorter)
- All configured in project settings

**TypeScript/JavaScript Tools:**
- ESLint (linting), Prettier (formatting)
- Auto-imports update when moving/renaming files

### What This Means for Claude

**DO:**
- ✅ Write code without worrying about formatting - tools handle it
- ✅ Trust that imports will be organized automatically
- ✅ Focus on logic and correctness, not style
- ✅ Verify settings work by checking `.vscode/settings.json` in each repo

**DON'T:**
- ❌ Manually format code to match style guides - auto-formatters do this
- ❌ Suggest running formatters unless they're failing
- ❌ Worry about line length, quote style, semicolons - tools enforce

**Extensions Installed:**
- ESLint, Prettier, Python (Black/Pylance), PowerShell, GitLens, Error Lens
- See `myTribe-Development.code-workspace` for complete list

📖 **Settings Details:** Each repo has `.vscode/settings.json` with project-specific config

---

## 🧠 Extended Reasoning

Use for complex problems requiring deep analysis:

- **"think"** → ~4,000 tokens (routine bugs, standard implementations)
- **"think hard" / "megathink"** → ~10,000 tokens (API integrations, moderate complexity)
- **"think harder" / "ultrathink"** → ~32,000 tokens (migrations, architecture decisions)

**When to use:**
- Architecture decisions and system design
- Complex refactoring with multiple dependencies
- Security threat modeling
- Performance optimization strategies
- Planning multi-step implementations

**Example:** "Think hard and propose 3 approaches for implementing caching across all Workers"

**Cost consideration:** Extended thinking consumes more tokens; use strategically

---

## 🗂️ Context Management

**Monitor token usage:** `/context` - Shows loaded files, token count, MCP calls

**Summarize & reset:** `/compact` - When context >50k tokens (preserves key info)

**Complete reset:** `/clear` - Between unrelated tasks

**Use `@filename` to:**
- Focus Claude on specific files (supports tab-completion)
- Avoid context pollution from irrelevant code
- Keep conversations focused on current task

**Signs context needs reset:**
- Responses reference old, unrelated discussions
- Repeating information from hours ago
- Mixing up different features/files
- Slower or less accurate responses

**Best practice:** One focused conversation per task, use `/compact` or `/clear` strategically

---

## ⚠️ AI Limitations & When NOT to Use

**Don't use AI for:**
- **Sequential dependent operations** - If Task B needs Task A's exact output, do manually
- **Deep domain regulations** - Insurance compliance, legal requirements (review required)
- **Blind trust on security** - Always manually review: SQL queries, auth logic, crypto
- **Highly sensitive decisions** - Deployment to production, data deletion

**AI Hallucinations:**
- May invent functions, libraries, or APIs that don't exist
- May reference outdated package versions or syntax
- Always verify: run the code, check docs, test thoroughly

**When in doubt:**
- Use AI to draft/propose
- You review and verify
- Run tests to confirm
- Manual approval for critical changes

---


## 💡 Quick Commands

- `#` - Add to memory (saves to this file)
- `/memory` - Edit CLAUDE.md directly
- `/workflow` - Development workflow guide
- `/commit-guide` - Git commit standards
- `/tdd-guide` - Test-driven development
- `/prompt-examples` - Effective prompt templates
- `/context-help` - Context management guide
- `/approval-guide` - When to ask permission

---

## 📞 Environment

**Workspace Root:** `C:\Users\chris\myTribe Development`

**Multi-repo workspace** (not monorepo) - each repo has own git history, deploys independently

### GitHub Context

**Organization:** `mytribeinsuranceexperts`
**Primary Repository:** `mytribe-workspace` (this workspace is also a GitHub repo)
When asked about GitHub repos/PRs/issues, default to `mytribeinsuranceexperts` organization.

---

## 🎓 Remember

**This is a hierarchical memory system:**
- Workspace CLAUDE.md (this file) = Global preferences and standards
- Project CLAUDE.md = Project-specific technical details
- Subdirectory CLAUDE.md = Most specific, localized context

**Keep each level focused:**
- Don't duplicate content between levels
- Link to shared documentation rather than copying
- Update this file when adding global preferences
- Update project CLAUDE.md for project-specific details

---

**Last Updated:** 2025-10-16
**Maintained By:** myTribe Insurance Development Team
**Claude Code Version:** Compatible with Claude Code 1.0+

<!-- End of CLAUDE.md -->
