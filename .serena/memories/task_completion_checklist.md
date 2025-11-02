# Task Completion Checklist

When a coding task is completed, follow this workflow:

## Pre-Commit Checklist
1. **Code Review**
   - Follows clean code principles
   - Security considerations addressed
   - No hardcoded secrets or sensitive data

2. **Testing** (if applicable)
   - Unit tests written/updated
   - Tests pass locally
   - Edge cases covered

3. **Auto-Formatting**
   - Runs automatically on save in VS Code
   - No manual formatting needed

## Commit Process
1. **Stage changes**: `git add <files>`
2. **Commit with conventional format**: `git commit -m "type: description"`
   - Types: feat, fix, docs, style, refactor, test, chore, security
3. **Push**: `git push`

## Documentation
- **Update existing docs only**
- **NEVER create new .md files without explicit permission**
- Remove completed reasoning, keep progress/deviations
- Clean as you go (don't append)

## Deployment (Railway projects)
- Most projects auto-deploy on push to main
- Check Railway dashboard for deployment status
- Monitor logs for errors: `railway logs`