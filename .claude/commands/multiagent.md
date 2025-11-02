# Multi-Agent Quick Reference

Use Claude Code's Task Tool to run parallel subagents for efficient work distribution.

## Quick Start

**Basic Pattern:**
```
Use parallel tasks to [explore/analyze/test/search] [target]
```

**Don't specify parallelism numbers** - let Claude optimize automatically for best performance.

## Common Use Cases

### Codebase Exploration
```
Explore the codebase using parallel tasks for different modules
```

### Parallel Testing
```
Run all tests in parallel: unit, E2E, Worker, accessibility
```

### Documentation Audit
```
Load roles/doc-expert.md
Use parallel tasks to verify documentation accuracy across all .md files
```

### Security Analysis
```
Load roles/security-eng.md
Use parallel tasks to security-audit all Cloudflare Workers
```

### Role Analysis
```
Use parallel tasks to analyze all role markdown files and identify overlaps
```

## Key Facts

- **Max Parallel:** 10 subagents concurrently (hard limit)
- **Queue:** Unlimited - automatically managed
- **Context:** Each subagent has independent context window
- **Best For:** Independent tasks (exploration, testing, analysis, search)
- **Avoid For:** Dependent tasks that need shared state

## myTribe Examples

### All Workers
```
Use parallel tasks to analyze each Cloudflare Worker:
allowed-bots-ip-updater, favicon-icon-handler, password-protected-pages,
person-schema-overnight, sitemap-generator-worker, traffic-health-ai-investigator,
traffic-health-monitor

Report test coverage and deployment status for each.
```

### Cross-Repository
```
Use 5 parallel tasks to analyze:
1. website-and-cloudflare
2. mytribe-ai-research-platform
3. sharepoint-forensics
4. powerbi-automation
5. development-wiki

Identify shared patterns and documentation gaps.
```

## Best Practices

**Do:**
- Let Claude decide parallelism (most efficient)
- Use for independent tasks
- Leverage context isolation for large files
- Scale to 100+ tasks when needed

**Don't:**
- Specify exact parallelism numbers (causes batching/waiting)
- Use for tasks that depend on each other
- Expect subagents to communicate

## Full Documentation

For complete guide with examples, patterns, and advanced usage:

**See:** [development-wiki/workflows/multi-agent-workflows.md](../../development-wiki/workflows/multi-agent-workflows.md)

## Related Resources

- [doc-expert.md](../../development-wiki/roles/doc-expert.md) - Parallel documentation audits
- [architecture-reviewer.md](../../development-wiki/roles/architecture-reviewer.md) - Parallel module analysis
- [qa-engineer.md](../../development-wiki/roles/qa-engineer.md) - Parallel test execution
- [security-eng.md](../../development-wiki/roles/security-eng.md) - Parallel security audits

---

**Quick Tip:** This command provides a condensed reference. For detailed patterns, troubleshooting, and advanced techniques, read the full workflow documentation.
