# Effective Prompt Examples

## Debugging

```
Error: [paste full error message]
Context: [what you were doing when it happened]
Relevant code: [paste code snippet]
Help me debug this issue.
```

## Security Review

```
Load roles/security-eng.md
Audit [component/file] for [specific threat: SQL injection, XSS, etc.]
Focus on: [input validation, authentication, etc.]
```

## Code Explanation

```
Explain this code in 3 bullet points: [paste code]
What are the edge cases?
What could go wrong?
```

## Refactoring

```
Refactor [file.js:100-150] to [goal: improve readability, reduce complexity]
Requirements: Keep behavior identical, all tests must pass, no breaking changes
```

## Code Review

```
Load roles/code-verifier.md
Review my last git changes
Check: security, performance, readability, test coverage
Report issues as actionable checklist
```

## Complex Planning

```
Think hard and outline 3 approaches for [problem]
For each approach: pros, cons, complexity, risks
Recommend which approach and why
```

## Exploration

```
Use parallel tasks to explore [component/directory]
Report: structure, dependencies, test coverage, issues
```

## Performance Optimization

```
Load .claude/agents/performance-engineer.md
Analyze [component/file] for performance bottlenecks
Focus on: [database queries, rendering, network calls]
```

## Accessibility Audit

```
Load .claude/agents/accessibility-specialist.md
Audit [component] for WCAG 2.1 AA compliance
Test: keyboard navigation, screen reader, color contrast
```

---

**Tip:** Be specific about what you need. Include error messages, relevant code, and context for best results.
