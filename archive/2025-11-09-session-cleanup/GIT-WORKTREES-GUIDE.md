# Git Worktrees - Quick Reference

## What Are Worktrees?
Worktrees let you have multiple branches checked out simultaneously in different directories.

## Why Use Them?
- Work on multiple features/bugs in parallel
- No context switching (no branch checkout needed)
- Each worktree gets its own Claude CLI session
- Perfect for juggling CQC integration + hospital pricing + bugfixes

## Common Commands

### Create a worktree for new feature:
```powershell
cd C:\Users\chris\myTribe-Development\mytribe-origin
git worktree add ..\mytribe-origin-feature-name feature-branch-name
```

### Create worktree for existing branch:
```powershell
git worktree add ..\mytribe-origin-cqc-integration cqc-integration
```

### List all worktrees:
```powershell
git worktree list
```

### Remove worktree when done:
```powershell
git worktree remove ..\mytribe-origin-feature-name
```

### Start Claude in a worktree:
```powershell
cd ..\mytribe-origin-feature-name
claude
```

## Example Workflow

**Scenario:** Working on CQC integration, bug reported

```powershell
# Terminal 1: Continue CQC work
cd C:\Users\chris\myTribe-Development\mytribe-origin-cqc
claude

# Terminal 2: Quick bugfix
cd C:\Users\chris\myTribe-Development\mytribe-origin
git worktree add ..\mytribe-origin-bugfix main
cd ..\mytribe-origin-bugfix
git checkout -b fix/critical-bug
claude
# Fix bug, commit, push, PR
cd ..\mytribe-origin
git worktree remove ..\mytribe-origin-bugfix
```

## Directory Structure

```
myTribe-Development/
├── mytribe-origin/              <- main branch (permanent)
├── mytribe-origin-cqc/          <- cqc-integration branch
├── mytribe-origin-pricing/      <- hospital-pricing branch
└── mytribe-origin-bugfix/       <- temporary bugfix branch
```

Each directory is independent - different files, different context, different Claude session.

## Best Practices

1. **Keep main worktree for main branch** - Don't delete `mytribe-origin/`
2. **Name worktrees consistently** - Use `repo-name-branch-name` pattern
3. **Clean up when done** - Remove worktrees after merging PRs
4. **One Claude session per worktree** - Keeps context clean

## Troubleshooting

**"fatal: 'branch' is already checked out"**
- Branch is already in use by another worktree
- Run `git worktree list` to see where

**Want to sync worktree with latest main:**
```powershell
cd mytribe-origin-feature
git fetch origin
git rebase origin/main
```

---

**Note:** This guide is scheduled for integration into `development-wiki/workflows/git-worktrees.md`
