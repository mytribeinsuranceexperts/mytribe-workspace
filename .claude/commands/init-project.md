# Initialize New Project

**Automated project setup with myTribe standards**

---

## Task

Set up a new project following myTribe Development standards.

---

## Steps

### 1. Create CLAUDE.md

Copy template to project root:

```bash
# Source: development-wiki/templates/CLAUDE.md
# Destination: [project-root]/CLAUDE.md
```

**Customize template:**
- [ ] Replace [Project Name] with actual name
- [ ] Fill in tech stack (language, framework, database, etc.)
- [ ] List key components
- [ ] Add common commands (dev, test, deploy)
- [ ] Document project structure
- [ ] Add security rules
- [ ] List environment variables
- [ ] Update quick reference section

---

### 2. Create .gitignore

Essential items to ignore:

```gitignore
# Environment
.env
.env.local
.env.*.local

# Secrets
*.key
*.pem
credentials.json
service-account.json

# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Build
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Project-specific
[add project-specific ignores]
```

---

### 3. Create .env.example

Template for environment variables:

```env
# Project: [PROJECT_NAME]
# Last Updated: [DATE]

# Application
APP_NAME=[project-name]
ENVIRONMENT=development

# Database (if applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys (NEVER commit actual values)
API_KEY=your_key_here
API_SECRET=your_secret_here

# [Add project-specific variables]
```

**Never commit actual `.env` file!**

---

### 4. Create README.md

Essential sections:

```markdown
# [Project Name]

[Brief description]

## Quick Start

[Setup steps]

## Development

[How to run locally]

## Testing

[How to run tests]

## Deployment

[Deployment process]

## Documentation

[Link to docs]

## Contributing

[How to contribute]
```

---

### 5. Link to Development Wiki

Add to README.md:

```markdown
## Development Standards

This project follows myTribe Development standards:

- [Git Workflow](../development-wiki/workflows/git-workflow.md)
- [Testing Strategy](../development-wiki/workflows/testing-strategy.md)
- [Code Quality](../development-wiki/standards/code-quality.md)
- [Security Practices](../development-wiki/standards/security-practices.md)

See [Development Wiki](../development-wiki/README.md) for complete documentation.
```

---

### 6. Create Project Structure

**Standard directories:**
```
[project-root]/
├── src/           # Source code
├── tests/         # All tests
├── docs/          # Documentation
├── .claude/       # Claude Code commands (optional)
│   └── commands/  # Project-specific slash commands
├── .env.example   # Environment template
├── .gitignore     # Git ignore rules
├── CLAUDE.md      # Project memory
├── README.md      # Main documentation
└── CHANGELOG.md   # Version history
```

---

### 7. Create CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- CLAUDE.md for AI assistance
- Development standards integration

## [0.1.0] - [YYYY-MM-DD]

### Added
- Project initialization
```

---

### 8. Set Up Slash Commands (Optional)

Create `.claude/commands/` directory with common commands:

**Suggested commands:**
- `review-code.md` - Code review workflow
- `run-tests.md` - Test execution workflow
- `deploy-staging.md` - Staging deployment (if applicable)

Copy templates from other projects as starting point.

---

### 9. Initialize Git

```bash
cd [project-root]
git init
git add .
git commit -m "chore: initial project setup

- Add CLAUDE.md for AI assistance
- Add .gitignore with standard exclusions
- Add .env.example template
- Add README.md with quick start
- Add CHANGELOG.md
- Link to development-wiki standards

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### 10. Create Remote Repository

```bash
# Create repo on GitHub: https://github.com/mytribeinsuranceexperts/[project-name]

# Add remote
git remote add origin https://github.com/mytribeinsuranceexperts/[project-name].git

# Push
git branch -M main
git push -u origin main
```

---

## Checklist

**Before completing:**

- [ ] CLAUDE.md created and customized
- [ ] .gitignore includes all sensitive files
- [ ] .env.example documents all required variables
- [ ] README.md has quick start instructions
- [ ] Project structure follows standards
- [ ] CHANGELOG.md initialized
- [ ] Links to development-wiki working
- [ ] Git initialized and first commit made
- [ ] Remote repository created
- [ ] Initial push successful

---

## Project-Specific Setup

**After initialization, add:**

- [ ] Language-specific config (package.json, pyproject.toml, etc.)
- [ ] Testing framework setup
- [ ] Linting/formatting tools
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Dependency management files

---

**Last Updated:** 2025-10-16
