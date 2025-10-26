# Git Commit Guide

## Conventional Commits Format

**Required for all commits across all repos:**

```
<type>: <description>

[optional body]

[optional footer]
```

## Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, white-space, etc. (no code change)
- `refactor:` - Code restructuring (no behavior change)
- `test:` - Adding or updating tests
- `chore:` - Maintenance (dependencies, config)
- `security:` - Security patches or improvements

## Examples

```bash
feat: add collapsible rows to premium calculator
fix: resolve table header misalignment in Safari
docs: update API authentication examples
test: add E2E tests for login flow
security: patch XSS vulnerability in search input
chore: update dependencies to latest versions
```

## Commit Workflow

1. **Review changes:** `git status` and `git diff`
2. **Stage files:** `git add <files>` (or `git add .` for all)
3. **Commit:** `git commit -m "type: description"`
4. **DO NOT push** without explicit approval

## Best Practices

- Keep first line under 72 characters
- Use imperative mood ("add feature" not "added feature")
- Reference issue numbers in body if applicable
- For breaking changes, add `BREAKING CHANGE:` footer
- Update CHANGELOG.md for user-facing changes

---

📖 **Full Details:** [development-wiki/standards/commit-conventions.md](../../development-wiki/standards/commit-conventions.md)
