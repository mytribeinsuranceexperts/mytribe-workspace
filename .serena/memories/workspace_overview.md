# myTribe Development Workspace Overview

## Workspace Structure

Multi-repo architecture - Each subdirectory and the root is an independent git repository:

- **mytribe-ai-research-platform/** - AI-powered query interface for health insurance pricing research. Recent work focuses on transparency features. Stack: Python FastAPI backend, React TypeScript frontend, PostgreSQL on Railway, Claude AI integration (Haiku 4.5 → Sonnet 4.5).

- **mytribe-origin/** - TypeScript MCP-native AI platform in MVP phase (Weeks 1-3 complete, Phase 3 deployed Oct 29). Stack: Cloudflare Workers, AWS Bedrock (Claude Haiku 4.5), Supabase PostgreSQL, React TypeScript frontend, JWT auth. **Will replace mytribe-ai-research-platform in time.**

- **website-and-cloudflare/** - Webflow site components and Cloudflare Workers for mytribeinsurance.co.uk. 7 production workers, inline components, CDN assets, HTML table builders. Stack: JavaScript ES6+, Cloudflare Workers, Vite.

- **comparison-forms/** - React 19 + TypeScript + Vite. **Deferred project.**
- **sharepoint-forensics/** - Not in use, not important.
- **powerbi-automation/** - Not in use, not important.
- **development-wiki/** - Shared standards, workflows, conventions. **Used frequently.**
- **docs/** - Architecture documentation. **May be out of date.**
- **.claude/agents/** - Specialized AI agent definitions. **Used frequently.**
- **research/** - Not a repo, but tools and methodologies to collect research data.

## Context Hierarchy

**Always reference context in this order:**
1. **Workspace CLAUDE.md** - Global preferences (C:\Users\chris\myTribe-Development\CLAUDE.md)
2. **Repo-specific CLAUDE.md** - Project context (e.g., mytribe-origin\CLAUDE.md)
3. **Serena memories** - Semantic code knowledge (this and other memory files)

**Key files:**
- mytribe-ai-research-platform\CLAUDE.md
- mytribe-origin\CLAUDE.md
- website-and-cloudflare\CLAUDE.md
- development-wiki\standards\code-quality.md
- .claude\agents\*.md (15 specialized agents)