---
name: agents-readme
description: Documentation file - not an agent
---

# Claude Code Custom Agents - myTribe Development

This directory contains **22 specialized agents** for the myTribe Development workspace.

## 📁 Available Agents

### Existing Agents (from development-wiki/roles)
1. **senior-dev** - Production code development and architecture
2. **security-eng** - Security reviews and vulnerability detection
3. **qa-engineer** - Testing and quality assurance
4. **devops** - Infrastructure and CI/CD
5. **doc-expert** - Documentation auditing and maintenance
6. **architecture-reviewer** - System design and complexity analysis
7. **code-verifier** - Hallucination detection and verification
8. **data-ml** - Data pipelines and AI workflows

### New Specialized Agents
9. **debugging-specialist** - Error analysis and troubleshooting
10. **performance-engineer** - Performance optimization and profiling
11. **api-designer** - REST API design and integration
12. **database-expert** - PostgreSQL optimization and migrations
13. **accessibility-specialist** - WCAG compliance and a11y testing
14. **docker-specialist** - Container optimization and Railway deployment
15. **workflow-orchestrator** - Multi-agent task coordination
16. **refactoring-specialist** - Code modernization and debt reduction
17. **infrastructure-security** - Cloud security and secrets management
18. **test-automation-expert** - E2E and integration testing
19. **powershell-specialist** - Windows automation and SharePoint
20. **seo-specialist** - SEO optimization and structured data
21. **css-ui-specialist** - Webflow-compatible CSS and responsive design
22. **python-specialist** - FastAPI and async Python patterns

---

## 🚀 How to Invoke Agents

### 1. Automatic Invocation (Recommended)

Claude Code automatically routes tasks based on the agent's `description` field. Just describe your need naturally:

**Examples:**

```
"Debug this Railway deployment error"
→ Automatically invokes debugging-specialist

"Optimize this slow database query"
→ Automatically invokes database-expert

"Make this form accessible"
→ Automatically invokes accessibility-specialist

"Review Dockerfile for best practices"
→ Automatically invokes docker-specialist

"Design a REST API for user management"
→ Automatically invokes api-designer

"Refactor this complex function"
→ Automatically invokes refactoring-specialist
```

### 2. Manual Invocation

You can explicitly request a specific agent:

**Examples:**

```
"Use the docker-specialist to optimize my Dockerfile"

"Have the performance-engineer analyze this code"

"Get the database-expert to help with this migration"

"Ask the seo-specialist to audit our meta tags"

"Use the python-specialist for this FastAPI endpoint"
```

### 3. Multi-Agent Workflows

Use the **workflow-orchestrator** to coordinate complex tasks:

**Example:**
```
"Use the workflow-orchestrator to implement a new insurance form with accessibility, testing, and SEO"
```

The orchestrator will:
1. Break down the task
2. Delegate to appropriate specialists (senior-dev, accessibility-specialist, qa-engineer, seo-specialist)
3. Coordinate parallel execution
4. Synthesize results

---

## 📋 Agent Selection Guide

### When You Need...

**Code Implementation:**
- General features → **senior-dev**
- Python backend → **python-specialist**
- CSS/UI → **css-ui-specialist**
- API design → **api-designer**

**Debugging & Performance:**
- Errors/failures → **debugging-specialist**
- Slow code → **performance-engineer**
- Database queries → **database-expert**

**Testing & Quality:**
- Test strategy → **qa-engineer**
- E2E/integration tests → **test-automation-expert**
- Code review → **code-verifier**
- Refactoring → **refactoring-specialist**

**Security:**
- Code security → **security-eng**
- Infrastructure security → **infrastructure-security**

**DevOps & Infrastructure:**
- Deployment pipelines → **devops**
- Docker/containers → **docker-specialist**
- Database schema → **database-expert**

**Specialized:**
- Accessibility → **accessibility-specialist**
- SEO → **seo-specialist**
- Windows/SharePoint → **powershell-specialist**
- System architecture → **architecture-reviewer**
- Documentation → **doc-expert**
- Multi-agent coordination → **workflow-orchestrator**

---

## 🔍 Checking Available Agents

Use the `/agents` command in Claude Code to see all available agents:

```
/agents
```

This shows:
- All custom agents
- Their descriptions
- Tool access
- Model configuration

---

## ⚙️ Agent Configuration

Each agent is defined with:

```yaml
---
name: agent-name
description: When to use this agent (triggers auto-invocation)
tools: List, Of, Tools, Agent, Can, Use
model: sonnet
---

[System prompt defining agent behavior]
```

**Key Fields:**
- `name`: Unique identifier (lowercase, hyphens)
- `description`: **Critical** - Claude uses this to decide when to auto-invoke
- `tools`: Optional tool restrictions (defaults to all tools)
- `model`: Optional model selection (sonnet, opus, haiku)

---

## 💡 Best Practices

### Writing Effective Prompts

**Good Prompts (Trigger Correct Agent):**
```
✅ "This Dockerfile is slow to build, optimize it"
   → docker-specialist (mentions Dockerfile)

✅ "The login form isn't screen-reader accessible"
   → accessibility-specialist (mentions accessibility)

✅ "Help me debug this 500 error in Railway logs"
   → debugging-specialist (mentions debugging + Railway)
```

**Vague Prompts (May Not Route Correctly):**
```
❌ "Fix this"
   → Too vague, may use wrong agent

❌ "Make it better"
   → No context for routing
```

### Agent Specialization

Agents are **single-purpose** by design:
- **debugging-specialist** investigates errors
- **performance-engineer** optimizes performance
- **refactoring-specialist** improves code structure

If you need multiple concerns addressed, use **workflow-orchestrator** to coordinate.

### Tool Restrictions

Some agents have restricted tool access for safety:
- **debugging-specialist**: Read-only + Bash (no Write/Edit)
- **database-expert**: No Write (prevents accidental schema changes)
- **seo-specialist**: No Bash (content-focused)

---

## 🧪 Testing Agent Invocation

After setup, test with these prompts:

1. **Docker specialist:**
   ```
   "Review the backend Dockerfile for optimization opportunities"
   ```

2. **Database expert:**
   ```
   "This query is slow, can you optimize it?"
   ```

3. **Debugging specialist:**
   ```
   "Railway deployment is failing, help me debug the logs"
   ```

4. **Accessibility specialist:**
   ```
   "Audit the insurance calculator for WCAG compliance"
   ```

5. **Workflow orchestrator:**
   ```
   "Coordinate building a new API endpoint with tests and docs"
   ```

---

## 📚 Related Documentation

- **Existing Roles**: `development-wiki/roles/` (8 original roles)
- **Workflows**: `development-wiki/workflows/multi-agent-workflows.md`
- **Official Docs**: [Claude Code Subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)

---

## 🔧 Maintenance

### Adding New Agents

1. Create new `.md` file in this directory
2. Include YAML frontmatter with name, description, tools, model
3. Write detailed system prompt
4. Test invocation with example prompts

### Updating Agents

1. Edit the agent's `.md` file
2. Update description if invocation triggers should change
3. Test that auto-invocation still works correctly

### Removing Agents

Simply delete the `.md` file. Claude Code will no longer see it in `/agents` list.

---

**Last Updated:** 2025-10-19
**Total Agents:** 22 (8 original + 14 new specialists)
**Workspace:** myTribe Development
