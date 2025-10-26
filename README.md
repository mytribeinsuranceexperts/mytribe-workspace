# myTribe Development Workspace

Multi-repository workspace for myTribe Insurance development projects.

## 📁 Repositories

| Repository | Technology | Purpose | Status | Documentation |
|-----------|-----------|---------|--------|---------------|
| [website-and-cloudflare](website-and-cloudflare/) | JavaScript, Cloudflare Workers | Webflow components + 7 Workers | ✅ Production | [README](website-and-cloudflare/README.md) |
| [mytribe-ai-research-platform](mytribe-ai-research-platform/) | Python, React, Railway + Claude API | AI research database | ✅ Deployed v1.0.0 | [README](mytribe-ai-research-platform/README.md) |
| [comparison-forms](comparison-forms/) | HTML5, CSS3, JavaScript | Multi-step insurance quote forms | ✅ Active | [README](comparison-forms/README.md) |
| [sharepoint-forensics](sharepoint-forensics/) | PowerShell | Data loss investigation | ✅ Active | [README](sharepoint-forensics/README.md) |
| [powerbi-automation](powerbi-automation/) | Python, JavaScript | Power BI automation | ⏳ Planning | [README](powerbi-automation/README.md) |
| [development-wiki](development-wiki/) | Markdown | Shared documentation | ✅ Active | [README](development-wiki/README.md) |

## 🚀 Quick Start

**New to this workspace? Start here:**

1. **Read the Development Wiki**: [development-wiki/README.md](development-wiki/README.md)
2. **Set up your environment**: [development-wiki/onboarding/new-developer-guide.md](development-wiki/onboarding/new-developer-guide.md) *(Coming soon)*
3. **Choose a repository**: Pick from the table above based on your task
4. **Read the repo README**: Each repository has comprehensive documentation
5. **Check Claude Code roles**: [development-wiki/roles/](development-wiki/roles/) - AI agent roles for development

## 📚 Shared Documentation

All repositories share standards and workflows via the **[development-wiki](development-wiki/)**:

- **[Roles](development-wiki/roles/)** - AI agent roles (doc-expert, senior-dev, qa-engineer, security-eng, devops, data-ml, architecture-reviewer, code-verifier)
- **[Workflows](development-wiki/workflows/)** - Git, versioning, testing, deployment, multi-agent
- **[Standards](development-wiki/standards/)** - Code quality, commit conventions, security practices

## 🔧 Technology Stack

- **Frontend**: React, Webflow
- **Backend**: Python (FastAPI), Node.js
- **Cloud**: Cloudflare Workers, Railway, Cloudflare R2
- **Databases**: PostgreSQL (Railway), SQLite
- **AI/LLM**: Claude Code, Claude API (Anthropic), LangChain
- **Testing**: Vitest, Playwright, Pester, pytest
- **Automation**: PowerShell, Python

## 🏗️ Workspace Structure

```
myTribe Development/
├── website-and-cloudflare/          # Production Webflow site + 7 Cloudflare Workers
│   ├── Cloudflare/                  # 7 active workers + archived
│   ├── src/                         # Webflow embed components
│   ├── tests/                       # 259 automated tests
│   └── docs/                        # Technical documentation
├── mytribe-ai-research-platform/    # AI research database (✅ Deployed v1.0.0)
│   ├── backend/                     # FastAPI + Claude API + LangChain (Railway)
│   ├── frontend/                    # React (in progress)
│   └── research-data/               # 11,893 pricing records + Datasette
├── comparison-forms/                # Multi-step insurance quote forms
│   ├── examples/                    # Form specifications and code
│   ├── images/                      # Brand assets and logos
│   └── screenshots/                 # Visual reference for forms
├── sharepoint-forensics/            # PowerShell tools for SharePoint investigation
├── powerbi-automation/              # Power BI PBIP automation (planned)
└── development-wiki/                # Shared documentation hub
    ├── roles/                       # 8 Claude Code roles
    ├── workflows/                   # 5 development workflows
    └── standards/                   # Code quality standards
```

## 📊 Workspace Statistics

- **Total Repositories**: 6 (5 active + 1 wiki)
- **Cloudflare Workers**: 7 active + 9 archived
- **Automated Tests**: 259+ (62 unit, 27 E2E, 139 Worker, 31 accessibility)
- **Documentation Files**: 67+
- **Research Database Records**: 11,893 insurance plans
- **Team Members**: 14 documented in Person schema

## 🔐 Security

- **Security Audit**: Completed 2025-10-15 (Risk score: 9.2/10)
- **API Key Management**: See [website-and-cloudflare/SECURITY.md](website-and-cloudflare/SECURITY.md)
- **Secrets Management**: Never commit credentials (enforced by git hooks)
- **Security Standards**: [development-wiki/standards/security-practices.md](development-wiki/standards/security-practices.md)

## 🧪 Testing

- **259 automated tests** across all repositories
- **100% pass rate** (as of 2025-10-15)
- **Testing Strategy**: [development-wiki/workflows/testing-strategy.md](development-wiki/workflows/testing-strategy.md)
- **CI/CD**: GitHub Actions (website-and-cloudflare)

## 🤖 AI-Assisted Development

This workspace extensively uses **Claude Code** for development:

- **8 specialized roles**: doc-expert, senior-dev, qa-engineer, security-eng, devops, data-ml, architecture-reviewer, code-verifier
- **Multi-agent workflows**: Parallel task execution for complex tasks
- **Quick reference**: Use `/multiagent` slash command
- **Full guide**: [development-wiki/workflows/multi-agent-workflows.md](development-wiki/workflows/multi-agent-workflows.md)

## 📖 Documentation

### By Repository
- **website-and-cloudflare**: 920-line README, SECURITY.md (645 lines), 7 Worker READMEs
- **mytribe-ai-research-platform**: 535-line README, CLAUDE.md (530 lines), research data docs
- **comparison-forms**: 500-line README, CLAUDE.md (400 lines), form specifications
- **sharepoint-forensics**: Comprehensive scenarios and troubleshooting
- **powerbi-automation**: Setup guide and planned architecture
- **development-wiki**: 14 core docs + 22 planned

### Key Documents
- [Git Workflow](development-wiki/workflows/git-workflow.md) - Multi-repo git practices
- [Testing Strategy](development-wiki/workflows/testing-strategy.md) - TDD, test types, coverage
- [Deployment Checklist](development-wiki/workflows/deployment-checklist.md) - Safe deployment procedures
- [Code Quality Standards](development-wiki/standards/code-quality.md) - Linting, formatting, best practices

## 🚦 Getting Started by Role

**New Developer:**
1. Read: [development-wiki/onboarding/new-developer-guide.md](development-wiki/onboarding/new-developer-guide.md) *(Coming soon)*
2. Clone: All 6 repositories
3. Setup: [development-wiki/tools/](development-wiki/tools/) *(Coming soon)*

**Deploying Code:**
1. Review: [development-wiki/workflows/deployment-checklist.md](development-wiki/workflows/deployment-checklist.md)
2. Test: Run all relevant tests first
3. Deploy: Follow repo-specific deployment guide

**Writing Tests:**
1. Read: [development-wiki/workflows/testing-strategy.md](development-wiki/workflows/testing-strategy.md)
2. Use: `roles/qa-engineer.md` Claude Code role
3. Run: Test suites for your repository

**Security Review:**
1. Use: `roles/security-eng.md` Claude Code role
2. Check: [development-wiki/standards/security-practices.md](development-wiki/standards/security-practices.md)
3. Audit: Follow security checklist

## 🔗 Useful Links

- **GitHub Organization**: [mytribeinsuranceexperts](https://github.com/mytribeinsuranceexperts)
- **Production Site**: https://www.mytribe.co.uk
- **Cloudflare Dashboard**: [Cloudflare Workers & R2](https://dash.cloudflare.com)
- **Research Database**: Local Datasette instance (mytribe-ai-research-platform)

## 🤝 Contributing

1. **Check the wiki**: [development-wiki/README.md](development-wiki/README.md) for standards
2. **Use git workflow**: [development-wiki/workflows/git-workflow.md](development-wiki/workflows/git-workflow.md)
3. **Write tests**: Follow [testing-strategy.md](development-wiki/workflows/testing-strategy.md)
4. **Security first**: Never commit secrets
5. **Document changes**: Update CHANGELOG.md

## 📝 Version Control

- **Git Workflow**: Multi-repo branching strategy
- **Commit Format**: Conventional commits (feat, fix, docs, etc.)
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Version Retention**: [website-and-cloudflare/docs/version-retention-policy.md](website-and-cloudflare/docs/version-retention-policy.md)

## 📅 Recent Updates

- **2025-10-16**: mytribe-ai-research-platform deployed to Railway (v1.0.0) ✅
- **2025-10-16**: Migrated from Google Cloud to Railway (£5-7/month cost savings)
- **2025-10-16**: All documentation updated to reflect Railway deployment
- **2025-10-15**: comparison-forms repository initialized with documentation
- **2025-10-15**: Development wiki centralization complete (8 roles, 5 workflows)
- **2025-10-15**: Security audit completed (9.2/10 risk score, reduced to 2.0/10)

## 📞 Support

- **Documentation Issues**: See [development-wiki/README.md](development-wiki/README.md)
- **Technical Questions**: Check repo-specific READMEs
- **Claude Code Help**: Reference [development-wiki/roles/](development-wiki/roles/)

---

**Last Updated**: 2025-10-16
**Maintained By**: myTribe Development Team
**Workspace Structure**: Multi-repository (6 repos)
