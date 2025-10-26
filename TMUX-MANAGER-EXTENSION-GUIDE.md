# Tmux Manager Extension - User Guide

**Status:** ✅ Installed and Ready
**Location:** Top-right toolbar (terminal icon)

---

## ✅ What You Got

A custom VS Code extension that appears in the **top-right corner** of:
- Every editor window
- Every terminal window

**Just like the Claude extension and Codex extension!**

---

## How to Use It

### Step 1: Find the Icon

**Look at the top-right corner of your VS Code window:**

```
┌─────────────────────────────────────────────────────────┐
│  File  Edit  View  ...              [Claude] [$(terminal)] │ ← HERE!
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your editor or terminal                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Look for the terminal icon:** `$(terminal)`

It appears:
- ✅ In editor title bar (when editing files)
- ✅ In terminal title bar (when terminal is focused)

### Step 2: Click the Icon

**A dropdown menu appears with these options:**

```
┌──────────────────────────────────────────────────────┐
│ Tmux Manager - Select an action                     │
├──────────────────────────────────────────────────────┤
│ ➕ Create New Session                                │
│    Start a new tmux session in a repository         │
│                                                      │
│ 🔗 Attach to Session                                 │
│    Connect to an existing tmux session              │
│                                                      │
│ 🔄 Refresh Sessions                                  │
│    Update the list of active sessions               │
│                                                      │
│ ⏸️ Detach All Sessions                               │
│    Detach from all tmux sessions                    │
│                                                      │
│ 🗑️ Kill Session                                      │
│    Terminate a specific tmux session                │
│                                                      │
│ ❌ Kill All Sessions                                  │
│    Terminate all tmux sessions                      │
└──────────────────────────────────────────────────────┘
```

---

## Complete Workflows

### Workflow 1: Create New Session

**Click terminal icon → "Create New Session"**

**Step 1: Select Repository**
```
┌────────────────────────────────────────┐
│ Select repository for new session     │
├────────────────────────────────────────┤
│ 📁 mytribe-ai-research-platform        │
│ 📁 comparison-forms                    │
│ 📁 website-and-cloudflare              │
│ 📁 powerbi-automation                  │
│ 📁 sharepoint-forensics                │
│ 📁 ai-video-generation                 │
└────────────────────────────────────────┘
```
Click your repo.

**Step 2: Select Branch**
```
┌────────────────────────────────────────┐
│ Select branch (optional)               │
├────────────────────────────────────────┤
│ ✓ Current Branch                       │
│   Use whatever branch is checked out   │
│                                        │
│ ✓ main                                 │
│   (Current)                            │
│                                        │
│ 🌿 feature/phase-10                    │
│                                        │
│ 🌿 backend/chart-api                   │
└────────────────────────────────────────┘
```
Select branch or use current.

**Step 3: Enter Session Name**
```
┌────────────────────────────────────────┐
│ Enter session name                     │
├────────────────────────────────────────┤
│ mytribe_ai_research_platform           │ ← Default
└────────────────────────────────────────┘
```
Type custom name or press Enter.

**Step 4: Auto-start Claude?**
```
┌────────────────────────────────────────┐
│ Start Claude Code automatically?       │
├────────────────────────────────────────┤
│ ✓ Yes - Auto-start Claude Code         │
│ ✕ No - Just open terminal              │
└────────────────────────────────────────┘
```

**Done!** Terminal opens with:
- ✅ tmux session running
- ✅ Correct repository
- ✅ Correct branch (if selected)
- ✅ Claude started (if selected)

### Workflow 2: Attach to Existing Session

**Click terminal icon → "Attach to Session"**

```
┌────────────────────────────────────────────────────┐
│ Select session to attach                           │
├────────────────────────────────────────────────────┤
│ 🖥️ backend_api                                     │
│   2 windows | Created: 10/22/2025, 2:30:00 PM     │
│   /home/dev/myTribe Development/mytribe-ai...     │
│                                                    │
│ 🖥️ frontend_work                                   │
│   1 windows | Created: 10/22/2025, 3:00:00 PM     │
│   /home/dev/myTribe Development/comparison...     │
│                                                    │
│ 🖥️ testing                                         │
│   1 windows | Created: 10/22/2025, 3:30:00 PM     │
│   /home/dev/myTribe Development/website...        │
└────────────────────────────────────────────────────┘
```

Click the session you want to attach to.

**Terminal opens attached to that session!**

### Workflow 3: Kill Specific Session

**Click terminal icon → "Kill Session"**

```
┌────────────────────────────────────────┐
│ Select session to kill                 │
├────────────────────────────────────────┤
│ 🗑️ backend_api                          │
│   2 windows                            │
│                                        │
│ 🗑️ frontend_work                        │
│   1 windows                            │
└────────────────────────────────────────┘
```

Select session to kill.

**Confirmation prompt:**
```
Kill tmux session 'backend_api'?
[Yes] [No]
```

### Workflow 4: Detach All (Before Leaving Office)

**Click terminal icon → "Detach All Sessions"**

✅ All sessions detached instantly
✅ All keep running in background
✅ Ready to reconnect from phone/home

### Workflow 5: Kill All Sessions (Clean Slate)

**Click terminal icon → "Kill All Sessions"**

**Warning prompt:**
```
⚠️ Kill all 3 tmux sessions? This cannot be undone!
[Yes] [No]
```

Confirm → All sessions terminated.

---

## Daily Usage Example

### Morning at Office

1. **Click terminal icon** (top-right)
2. **Create New Session**
   - Repo: `mytribe-ai-research-platform`
   - Branch: `feature/phase-10`
   - Name: `phase10_work`
   - Claude: Yes
3. Claude starts, give task:
   ```
   Claude, implement Phase 10 security features
   ```

### Lunchtime Check (Phone)

```bash
ssh dev@server
tml  # See: phase10_work
tma phase10_work  # Attach
# Check Claude's progress
tmd  # Detach
```

### Afternoon - Add Frontend Work

1. **Click terminal icon**
2. **Create New Session**
   - Repo: `comparison-forms`
   - Branch: `main`
   - Name: `frontend_ui`
   - Claude: Yes

**Now you have 2 sessions side-by-side!**

### End of Day

1. **Click terminal icon**
2. **Detach All Sessions**
3. Close browser
4. Sessions keep running overnight!

### Next Morning

1. **Click terminal icon**
2. **Attach to Session** → `phase10_work`
3. Pick up exactly where you left off!

---

## Keyboard Shortcuts (Optional)

You can also access via Command Palette:

1. Press `Ctrl+Shift+P`
2. Type: `Tmux:`
3. See all commands:
   - `Tmux: Create New Session`
   - `Tmux: Attach to Session`
   - `Tmux: Kill Session`
   - `Tmux: Detach All Sessions`
   - `Tmux: Kill All Sessions`

---

## Troubleshooting

### Issue: Can't Find the Terminal Icon

**Check:**
1. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Look for `$(terminal)` icon in top-right
3. Try opening an editor file or terminal - icon should appear

**Verify extension is installed:**
```bash
code-server --list-extensions | grep tmux
```

Should show: `mytribe.tmux-manager`

### Issue: "No repositories found"

**Cause:** Extension can't detect git repos

**Solution:**
- Make sure you're in the "myTribe Development" workspace
- Each repo folder should have a `.git` directory
- Reload window and try again

### Issue: Sessions Not Listed

**Cause:** No tmux sessions running

**Solution:**
- Use "Create New Session" to start one
- Or manually: `tmux new -s test`
- Then "Refresh Sessions"

### Issue: Can't Attach to Session

**Cause:** Session might have been killed

**Solution:**
- Click terminal icon → "Refresh Sessions"
- Check if session still exists: `tml` in terminal
- Create new session if needed

---

## Extension Files

**Location:** `/home/dev/myTribe Development/tmux-manager-extension/`

**Files:**
- `package.json` - Extension manifest
- `src/extension.ts` - Main extension code
- `src/tmuxManager.ts` - Tmux operations
- `tmux-manager-1.0.0.vsix` - Packaged extension

**To update extension:**
```bash
cd "/home/dev/myTribe Development/tmux-manager-extension"
npm run compile
npx vsce package
code-server --install-extension tmux-manager-1.0.0.vsix
```

Then reload VS Code window.

---

## Comparison: Before vs After

**❌ Before (Command-line only):**
```bash
# Create session
tmux new -s session_name -c "/path/to/repo"
cd /path/to/repo
git checkout branch
claude

# Attach
tmux attach -t session_name

# Kill
tmux kill-session -t session_name
```

**✅ After (Visual UI):**
```
Click icon → Select action → Follow prompts → Done!
```

---

## Summary: What You Can Do

**From the terminal icon in top-right:**

✅ **Create** - New tmux sessions in any repo/branch with optional Claude
✅ **Attach** - Connect to existing sessions with one click
✅ **Kill** - Terminate specific sessions or all at once
✅ **Detach** - Disconnect from all sessions before leaving
✅ **Refresh** - Update session list
✅ **Visual** - See session details (windows, created time, path)

**No more memorizing commands!**
**No more typing long paths!**
**Just click and select!** 🎉

---

## Next Steps

**Try it now:**

1. **Look at top-right of this window**
2. **Click the terminal icon** ($(terminal))
3. **Select "Create New Session"**
4. **Follow the prompts**
5. **Watch it create and attach!**

---

**Last Updated:** 2025-10-22
**Extension Version:** 1.0.0
**Installed:** ✅ Yes

<!-- End of TMUX-MANAGER-EXTENSION-GUIDE.md -->
