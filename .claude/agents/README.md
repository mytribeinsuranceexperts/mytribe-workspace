# Specialized Agents Directory

This directory contains 19 specialized AI agents optimized for specific development tasks in the myTribe development workspace.

## Quick Reference

Agents are automatically suggested when keywords match your request, or load manually by referencing `.claude/agents/<name>.md`.

**When user mentions keywords, Claude will ask if you want to load the relevant agent.**

---

## Available Agents (by Category)

### Development & Code Quality

**refactoring-specialist.md**
- Code modernization, technical debt reduction, complexity analysis
- Use for: Improving structure, eliminating duplication, reducing complexity
- Keywords: refactor, complexity, technical debt, code smell

**python-specialist.md**
- FastAPI, async/await, Python 3.11+ best practices
- Use for: AI platform backend, async database operations, type hints
- Keywords: python, fastapi, async, pydantic

**powershell-specialist.md**
- Windows automation, SharePoint scripting, Power BI integration
- Use for: sharepoint-forensics, powerbi-automation, Azure
- Keywords: powershell, sharepoint, power bi, windows

**llm-integration-specialist.md**
- Multi-LLM orchestration, prompt engineering, cost optimization
- Use for: AI workflows, model selection, prompt caching, quota management
- Keywords: llm, anthropic, claude, prompt, ai orchestration

---

### Frontend & UI

**css-ui-specialist.md**
- Webflow-compatible CSS, component styling, responsive design
- Use for: Custom components, namespace conflicts, inline vs sitewide styling
- Keywords: css, webflow, responsive, styling, component

**accessibility-specialist.md**
- WCAG compliance, screen reader testing, keyboard navigation
- Use for: Insurance form accessibility, ARIA labels, semantic HTML
- Keywords: accessibility, wcag, a11y, screen reader, aria

**seo-specialist.md**
- SEO optimization, structured data, meta tags
- Use for: Insurance website SEO, schema.org markup, Core Web Vitals
- Keywords: seo, meta tags, schema, structured data, sitemap

---

### API & Architecture

**api-designer.md**
- REST API design, endpoint documentation, third-party integration
- Use for: New APIs, OpenAPI specs, Claude API, Airtable integration
- Keywords: api, endpoint, rest, integration, openapi

**mcp-architect.md**
- MCP server architecture and protocol design
- Use for: Custom MCP servers, state management, server-to-server communication
- Keywords: mcp, server, protocol, architecture

---

### Database & Data

**database-expert.md**
- PostgreSQL schema design, query optimization, migration safety
- Use for: Complex SQL, performance issues, Railway PostgreSQL, schema changes
- Keywords: database, postgres, sql, query, migration

**data-engineer.md**
- ETL pipelines, data migration, data quality validation
- Use for: Database migrations, data imports, integrity checks, archival
- Keywords: etl, migration, data pipeline, import, archival

**data-verifier.md**
- Independent data quality verification using alternative methods
- Use for: Validating research accuracy, cross-checking extracted data
- Keywords: verify, validation, accuracy, quality check

---

### Infrastructure & Deployment

**docker-specialist.md**
- Docker containerization, Railway deployment optimization
- Use for: Dockerfile optimization, multi-stage builds, Railway configuration
- Keywords: docker, container, railway, deployment

**infrastructure-security.md**
- Cloud security, IAM policies, secrets management, compliance
- Use for: Railway security, environment variables, PostgreSQL access control
- Keywords: security, secrets, iam, compliance, cloud security

**performance-engineer.md**
- Performance optimization and bottleneck analysis
- Use for: Slow pages, Worker timeouts, query optimization, bundle size
- Keywords: performance, slow, optimize, bottleneck, speed

---

### Testing & Quality Assurance

**test-automation-expert.md**
- E2E test setup, test fixtures, integration testing
- Use for: Complex test scenarios, mock data, Railway integration tests
- Keywords: test, e2e, integration, pytest, playwright

**debugging-specialist.md**
- Systematic error analysis and troubleshooting
- Use for: Stack traces, failed tests, production errors, Railway logs
- Keywords: debug, error, bug, troubleshoot, logs

---

### Research & Data Collection

**web-researcher.md**
- Web scraping, data extraction, research automation
- Use for: Collecting structured data, extracting pricing, Playwright automation
- Keywords: scraping, extraction, playwright, research, data collection

---

### Workflow & Coordination

**workflow-orchestrator.md**
- Multi-agent task coordination and project management
- Use for: Complex features across repos, parallel workflows, multi-step implementations
- Keywords: coordinate, orchestrate, multi-step, workflow, planning

---

## Usage Examples

**Automatic loading:**
```
User: "I need to optimize this slow SQL query"
Claude: "I notice you're working on database performance. Would you like me to load the database-expert agent?"
```

**Manual loading:**
```
User: "Load the refactoring-specialist agent"
Claude: [loads agent and applies specialized context]
```

**Multi-agent workflows:**
```
User: "I need to build a new API endpoint with frontend"
Claude: [Suggests workflow-orchestrator to coordinate api-designer, python-specialist, and test-automation-expert]
```

---

## Agent Selection Guide

### By Task Type

**New Feature Development:**
1. api-designer (design endpoints)
2. python-specialist (implement backend)
3. css-ui-specialist (frontend styling)
4. test-automation-expert (write tests)

**Performance Issues:**
1. performance-engineer (identify bottlenecks)
2. database-expert (optimize queries)
3. docker-specialist (optimize containers)

**Code Quality:**
1. refactoring-specialist (improve structure)
2. debugging-specialist (fix bugs)
3. test-automation-expert (add tests)

**Security & Compliance:**
1. infrastructure-security (cloud security)
2. accessibility-specialist (WCAG compliance)
3. seo-specialist (meta tags, structured data)

**Data & Research:**
1. web-researcher (extract data)
2. data-verifier (validate accuracy)
3. data-engineer (ETL pipelines)

---

## Agent Capabilities Summary

| Agent | Primary Tools | Model | Best For |
|-------|--------------|-------|----------|
| refactoring-specialist | Read, Edit, Grep | Sonnet | Code modernization |
| python-specialist | Read, Edit, Bash | Sonnet | FastAPI backend |
| powershell-specialist | Read, Edit, Bash | Sonnet | Windows automation |
| llm-integration-specialist | Read, Edit | Sonnet | Multi-LLM workflows |
| css-ui-specialist | Read, Edit | Sonnet | Webflow styling |
| accessibility-specialist | Read, Edit | Sonnet | WCAG compliance |
| seo-specialist | Read, Edit, WebSearch | Sonnet | SEO optimization |
| api-designer | Read, Edit, WebSearch | Sonnet | API design |
| mcp-architect | Read, Edit | Sonnet | MCP servers |
| database-expert | Read, Grep, Bash | Sonnet | PostgreSQL optimization |
| data-engineer | Read, Edit, Bash | Sonnet | ETL pipelines |
| data-verifier | Read, Playwright, WebFetch | Haiku | Data validation |
| docker-specialist | Read, Edit, Bash | Sonnet | Container optimization |
| infrastructure-security | Read, Grep, Bash | Sonnet | Cloud security |
| performance-engineer | Read, Grep, Bash | Sonnet | Performance optimization |
| test-automation-expert | Read, Edit, Bash | Sonnet | E2E testing |
| debugging-specialist | Read, Grep, Bash | Sonnet | Error analysis |
| web-researcher | Playwright, Filesystem, Time | Haiku | Web scraping |
| workflow-orchestrator | Read, TodoWrite, Task | Sonnet | Multi-agent coordination |

---

## Creating Custom Agents

Each agent follows this structure:

```markdown
---
name: agent-name
description: Brief description for auto-suggestion
tools: List of tools agent can use
model: sonnet | haiku
---

# Role: Agent Name

**Objective:** Clear statement of agent's purpose

**Responsibilities:** Bulleted list of what agent does

**[Domain-Specific Sections]**
- Best practices
- Examples
- Patterns
- Constraints

**Deliverables:** What agent produces

**Output Format:** Template for agent responses
```

---

## Best Practices

1. **Single Responsibility**: Each agent has ONE clear purpose
2. **Tool Access**: Agents only list tools they actually need
3. **Model Selection**: Use Haiku for speed/cost, Sonnet for complexity
4. **Clear Constraints**: Define what agent should NOT do
5. **Output Consistency**: Template responses for predictable results

---

## Integration with CLAUDE.md

Agents work hierarchically with workspace context:

1. **Workspace CLAUDE.md** (global preferences)
2. **Project CLAUDE.md** (project-specific)
3. **Agent .md** (specialized task context)

Agent context is added temporarily and doesn't persist between sessions.

---

## Contributing New Agents

When creating new agents:

1. Identify clear, focused responsibility (Single Responsibility Principle)
2. Define specific keywords for auto-suggestion
3. Specify minimum required tools
4. Choose appropriate model (Haiku for efficiency, Sonnet for complexity)
5. Include examples and anti-patterns
6. Define deliverables and output format
7. Add to this README in appropriate category

---

**Last Updated:** 2025-10-31
**Total Agents:** 19
**Team:** myTribe Insurance Experts
