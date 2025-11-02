# Suggested Commands for myTribe Development

## MCP-First Approach

**Always prefer MCP tools over CLI when available:**
- Use `mcp__railway__*` over `railway` CLI
- Use `mcp__supabase__*` over `supabase` CLI  
- Use `mcp__github__*` over `gh` CLI
- Use `mcp__playwright__*` over manual browser testing
- Use `mcp__filesystem__*` for file operations when appropriate
- Use `mcp__memory__*` for persistent knowledge graph
- Use `mcp__cloudflare-docs__*` for Cloudflare documentation
- Use `mcp__aws-bedrock-agentcore__*` for AWS Bedrock AgentCore docs
- Use `mcp__time__*` for date/time operations

## Railway Operations (Use MCP)

```bash
# Check Railway status
mcp__railway__check-railway-status

# List projects
mcp__railway__list-projects

# List services
mcp__railway__list-services

# Deploy
mcp__railway__deploy

# Get logs
mcp__railway__get-logs

# Set variables
mcp__railway__set-variables

# Generate domain
mcp__railway__generate-domain

# Fallback CLI (if MCP unavailable)
railway login
railway link
railway up
railway logs
```

## Supabase Operations (Use MCP)

```bash
# List tables
mcp__supabase__list_tables

# Execute SQL
mcp__supabase__execute_sql

# Apply migration
mcp__supabase__apply_migration

# Get logs
mcp__supabase__get_logs

# Fallback: Direct SQL in psql or Supabase dashboard
```

## GitHub Operations (Use MCP)

```bash
# Create PR
mcp__github__create_pull_request

# Create issue
mcp__github__create_issue

# Push files
mcp__github__push_files

# Search code
mcp__github__search_code

# Fallback CLI
gh pr create
gh issue create
```

## Memory Operations (Use MCP)

```bash
# Create entities in knowledge graph
mcp__memory__create_entities

# Create relations between entities
mcp__memory__create_relations

# Add observations to entities
mcp__memory__add_observations

# Search nodes
mcp__memory__search_nodes

# Read entire graph
mcp__memory__read_graph
```

## Date/Time Operations (Use MCP)

```bash
# Get current date in various formats
mcp__time__get_current_date

# Get date components (year, month, day, etc)
mcp__time__get_date_components
```

## Documentation Search (Use MCP)

```bash
# Search Cloudflare documentation
mcp__cloudflare-docs__search_cloudflare_documentation

# Search AWS Bedrock AgentCore documentation
mcp__aws-bedrock-agentcore__search_agentcore_docs

# Fetch full document content
mcp__aws-bedrock-agentcore__fetch_agentcore_doc
```

## System Commands (Windows)

```powershell
# File operations (prefer MCP filesystem tools when in Claude Code)
dir
cd <path>
findstr <pattern> <files>

# Git operations
git status
git add .
git commit -m "type: description"
git push
git log --oneline -5
```

## Python Projects (mytribe-ai-research-platform)

```bash
# Virtual environment
python -m venv venv
venv\Scripts\activate

# Dependencies
pip install -r requirements.txt

# Testing (prefer pytest-service MCP when available)
pytest
pytest tests/ -v
pytest --cov

# Linting (auto-runs on save)
black .
flake8
isort .

# Run FastAPI
uvicorn app.main:app --reload
```

## JavaScript/TypeScript Projects (website-and-cloudflare, mytribe-origin)

```bash
# Dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Testing
npm test
npm run test:watch

# Linting (auto-runs on save)
npm run lint

# Cloudflare Workers
npm run deploy        # Deploy to Cloudflare
wrangler dev          # Local development
wrangler tail         # View logs
```

## Git Workflow

```bash
# Conventional commits: <type>: <description>
# Types: feat, fix, docs, style, refactor, test, chore, security

git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect bug"
git commit -m "docs: update API documentation"
git commit -m "security: patch XSS vulnerability"
```

## Browser Testing (Use MCP)

```bash
# Playwright MCP (preferred)
mcp__playwright__browser_navigate
mcp__playwright__browser_click
mcp__playwright__browser_take_screenshot

# Fallback
npx playwright test
```