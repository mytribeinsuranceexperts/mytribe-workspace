# .claude/ Directory

**Last Updated:** 2025-11-03

## Overview

This directory contains Claude Code workspace configuration, agent personas, and archived context files.

## Directory Structure

```
.claude/
├── agents/              # Specialized AI assistant personas (19 agents)
│   ├── README.md        # Agent directory and usage guide
│   ├── api-designer.md
│   ├── database-expert.md
│   ├── debugging-specialist.md
│   ├── docker-specialist.md
│   ├── infrastructure-security.md
│   ├── llm-integration-specialist.md
│   ├── performance-engineer.md
│   ├── refactoring-specialist.md
│   ├── test-automation-expert.md
│   └── ... (13 more agent files)
├── archive/             # Historical context and archived files
│   └── 2025-11-03-corrupted-file/
│       ├── README.md    # Archive explanation and details
│       └── CLAUDE.md.corrupted  # Preserved corrupted file
├── commands/            # Command definitions
├── debug/               # Debug utilities
├── downloads/           # Downloaded resources
├── file-history/        # File edit history
├── ide/                 # IDE settings
├── plugins/             # Plugin configurations
├── projects/            # Project metadata
├── shell-snapshots/     # Shell session snapshots
├── statsig/             # Statsig configurations
├── todos/               # Task tracking
├── README.md            # This file
├── .credentials.json    # Credentials (gitignored)
├── settings.json        # Claude Code settings
├── settings.local.json  # Local settings overrides
└── ... (other config files)
```

## Global Workspace Preferences

**Authoritative documentation:** See workspace root `../CLAUDE.md` (373 lines)

This directory does not contain a global CLAUDE.md configuration file. All workspace-wide preferences, rules, and context are documented in the workspace root CLAUDE.md file.

## Agents

The `agents/` subdirectory contains 19 specialized AI assistant personas that can be loaded on-demand:

- **api-designer.md** - REST API design and architecture
- **database-expert.md** - Database design, optimization, migrations
- **debugging-specialist.md** - Problem diagnosis, error analysis, log investigation
- **docker-specialist.md** - Container orchestration, Docker configuration
- **infrastructure-security.md** - Security architecture, threat modeling
- **llm-integration-specialist.md** - LLM integration, prompt engineering
- **performance-engineer.md** - Performance optimization, benchmarking
- **refactoring-specialist.md** - Code quality improvement, design patterns
- **test-automation-expert.md** - Testing strategies, test automation
- And 10 more agents...

See [agents/README.md](agents/README.md) for complete agent directory and usage instructions.

## Archive

The `archive/` subdirectory preserves historical context and corrupted files:

- **2025-11-03-corrupted-file/** - Archived corrupted CLAUDE.md with investigation details

See individual archive subdirectories for detailed README files explaining what was archived and why.

## Configuration Files

- **settings.json** - Claude Code workspace settings
- **settings.local.json** - Local overrides (user-specific)
- **.credentials.json** - API credentials (gitignored)

## Accessing Workspace Rules

For workspace-wide rules, preferences, and context:

1. **Read:** `../CLAUDE.md` (workspace root, 373 lines, authoritative)
2. **For quick reference:** Load the appropriate agent from `agents/`
3. **For project-specific rules:** See `../[project-name]/CLAUDE.md`

## Maintenance

- Archive corrupted or superseded files in `archive/YYYY-MM-DD-description/`
- Update agent files only through Claude Code sessions (marked readonly)
- Keep settings.json consistent across team members
- Use settings.local.json for personal overrides
