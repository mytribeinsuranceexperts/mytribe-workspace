# Quick Terminal Menu System - User Guide

**Created:** 2025-10-22
**Status:** ✅ Fully Configured

---

## Overview

You now have a **menu-driven system** for creating and managing tmux terminal sessions in VS Code Server.

**No more typing commands!** Just click dropdowns and select options.

---

## How to Use: New Terminal in Specific Repo

### Step 1: Open Terminal Dropdown

**In VS Code Server:**

1. Look at the terminal panel (bottom of screen)
2. Click the **+** (plus) icon with dropdown arrow
3. A menu appears with all repositories

### Step 2: Select Repository

**Available options:**
- 🌐 **AI Research Platform** (mytribe-ai-research-platform)
- 🖥️ **Comparison Forms** (comparison-forms)
- ☁️ **Website & Cloudflare** (website-and-cloudflare)
- 📊 **PowerBI Automation** (powerbi-automation)
- 🗄️ **SharePoint Forensics** (sharepoint-forensics)
- 🎥 **AI Video Generation** (ai-video-generation)
- 🔗 **Attach to tmux session** (connect to existing)

### Step 3: Name Your Session (Optional)

**After clicking a repo, the script prompts:**

```
Starting tmux session for: mytribe-ai-research-platform
Press Enter to use default name: mytribe_ai_research_platform
Or type custom name (5 seconds):
```

**Your choices:**
- Press **Enter** → Uses default name (repo name)
- Type **custom name** → Uses your name (e.g., "api-work", "testing")
- Wait 5 seconds → Uses default automatically

### Step 4: Auto-Start Claude (Optional)

**Next prompt:**

```
Start Claude automatically? [Y/n]:
```

**Your choices:**
- Press **Enter** or **Y** → Claude launches automatically
- Type **n** → Opens at command prompt (you can type `claude` later)
- Wait 3 seconds → Auto-starts Claude

### Step 5: Work in Your Session

**Terminal opens with:**
- ✅ tmux session running
- ✅ Correct repository directory
- ✅ Claude Code ready (if you chose auto-start)
- ✅ Persistent - survives disconnections

---

## How to Use: Attach to Existing Session

### Step 1: Open Terminal Dropdown

Click **+ dropdown** in terminal panel

### Step 2: Select "Attach to tmux session"

This opens an interactive menu

### Step 3: Choose Session

**Menu shows:**
```
╔════════════════════════════════════════════════════════╗
║  Active tmux Sessions                                  ║
╚════════════════════════════════════════════════════════╝

 1) api_work                     1 windows  Created: 2025-10-22 14:30
 2) frontend_ui                  1 windows  Created: 2025-10-22 15:00
 3) testing                      1 windows  Created: 2025-10-22 15:30

Enter session number to attach (1-3), or session name:
```

**Your choices:**
- Type **1**, **2**, **3**, etc. → Attaches to that numbered session
- Type **session name** → Attaches to that named session
- If only 1 session exists → Attaches automatically

---

## Visual Guide: Where to Click

```
┌─────────────────────────────────────────────────────┐
│  VS Code Server - Terminal Panel                   │
├─────────────────────────────────────────────────────┤
│  Terminal    + ▼   Split  Trash                    │ ← Click here!
│              └─┬───────────────────────────────────┐│
│                │ AI Research Platform              ││
│                │ Comparison Forms                  ││
│                │ Website & Cloudflare              ││
│                │ PowerBI Automation                ││
│                │ SharePoint Forensics              ││
│                │ AI Video Generation               ││
│                │ Attach to tmux session            ││
│                │ bash                              ││
│                └───────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## Complete Workflow Examples

### Example 1: Start Work on AI Platform

**Action:**
1. Click **+ ▼** dropdown
2. Select **"AI Research Platform"**
3. Prompt: Type **"backend-api"** as session name
4. Prompt: Press **Enter** to start Claude
5. Claude opens, ready to work!

**Result:**
- Session name: `backend-api`
- Directory: `/home/dev/myTribe Development/mytribe-ai-research-platform`
- Claude: Running
- Persistent: Yes

**Give Claude task:**
```
Claude, fix the authentication bugs in the API endpoints
```

**Leave office:**
Type: `tmd` (detach)

**From phone later:**
```bash
ssh dev@server
tma backend-api
```

### Example 2: Multiple Repos Side-by-Side

**Create 3 terminals in different repos:**

**Terminal 1:**
1. Click **+ ▼** → **AI Research Platform**
2. Name: **backend**
3. Start Claude: **Yes**

**Terminal 2:**
1. Click **+ ▼** → **Comparison Forms**
2. Name: **frontend**
3. Start Claude: **Yes**

**Terminal 3:**
1. Click **+ ▼** → **Website & Cloudflare**
2. Name: **cdn**
3. Start Claude: **No** (manual commands)

**Now you have 3 side-by-side terminals:**
- Each in different repo
- Each in separate tmux session
- Each can be detached independently

**Detach all before leaving:**
```bash
tmux detach-client -a
```

### Example 3: Reconnect to Existing Work

**You left office with 3 sessions running.**

**At home, open VS Code Server:**

1. Click **+ ▼** dropdown
2. Select **"Attach to tmux session"**
3. Menu shows:
   ```
   1) backend      1 windows  Created: 2025-10-22 14:00
   2) frontend     1 windows  Created: 2025-10-22 14:15
   3) cdn          1 windows  Created: 2025-10-22 14:30
   ```
4. Type **1** → Attaches to backend
5. Claude is still there, exactly where you left it!

**Want to see all 3 side-by-side again?**

1. Split terminal (Ctrl+Shift+5)
2. In new split, click **+ ▼** → **"Attach to tmux session"** → **2**
3. Split again → **"Attach to tmux session"** → **3**
4. All 3 sessions back, side-by-side!

---

## Keyboard Shortcuts (Still Work)

**If you prefer typing over clicking:**

| Action | Command |
|--------|---------|
| New terminal in AI platform | `tmai` |
| New terminal in forms | `tmforms` |
| New terminal in website | `tmweb` |
| Attach to session | `tma session-name` |
| List sessions | `tml` |
| Detach current | `tmd` |
| Detach all | `tmux detach-client -a` |

---

## FAQ

### Q: What if I forget to name the session?

**A:** Default name is the repo name (e.g., `mytribe_ai_research_platform`). You can always rename later:

```bash
tmux rename-session new-name
```

### Q: What if I don't want Claude to auto-start?

**A:** Type **n** when prompted, or wait until after session starts and type `claude` manually.

### Q: Can I create multiple sessions in the same repo?

**A:** Yes! Just give each a different name:
- Session 1: `api-work`
- Session 2: `api-testing`
- Session 3: `api-docs`

All in same repo, different tmux sessions.

### Q: What if the dropdown doesn't show my repos?

**A:** Reload VS Code window:
1. Press `Ctrl+Shift+P`
2. Type "Reload Window"
3. Select "Developer: Reload Window"

### Q: Can I add more repos to the dropdown?

**A:** Yes! Edit [`.vscode/settings.json`](.vscode/settings.json) and add a new profile:

```json
"New Repo Name": {
    "path": "/home/dev/bin/tmux-repo",
    "args": ["new-repo-folder-name"],
    "icon": "folder",
    "overrideName": true
}
```

Then reload VS Code.

### Q: What happens if I select a session that's already open?

**A:** The script detects it and attaches to the existing session instead of creating a duplicate.

### Q: Can I use this from my phone?

**A:** The dropdown menu only works in VS Code Server web UI. From phone SSH, use commands:
- `tmai` - Start in AI platform
- `tma session-name` - Attach to session
- `tml` - List sessions

---

## Technical Details

### Scripts Created

**1. `/home/dev/bin/tmux-repo`**
- Creates tmux session in specific repository
- Prompts for custom session name
- Optionally auto-starts Claude
- Usage: `tmux-repo <repo-folder-name>`

**2. `/home/dev/bin/tmux-attach-menu`**
- Interactive menu to attach to existing sessions
- Lists all active sessions with details
- Numbered selection or name-based
- Usage: `tmux-attach-menu`

### VS Code Configuration

**Modified:** `.vscode/settings.json`

**Added terminal profiles:**
- One for each repository
- One for attaching to existing sessions
- Each calls the helper scripts with appropriate arguments

---

## Troubleshooting

### Issue: Dropdown doesn't show repo names

**Solution:**
```bash
# Verify scripts exist and are executable
ls -la ~/bin/tmux-repo ~/bin/tmux-attach-menu

# Make executable if needed
chmod +x ~/bin/tmux-repo ~/bin/tmux-attach-menu

# Reload VS Code
Ctrl+Shift+P → "Developer: Reload Window"
```

### Issue: Script times out waiting for input

**Cause:** Running in non-interactive mode

**Solution:**
- Scripts have 5-second timeout for name, 3-second for Claude
- Just press Enter quickly, or wait for defaults

### Issue: Session name conflicts

**Cause:** Trying to create session with name that exists

**Solution:**
- Script automatically attaches to existing session
- Or type a different name when prompted

---

## Summary: What You Asked For vs What You Got

### ✅ What You Wanted:

1. **Right-click → "Add new terminal in AI Research Platform"**
   - **Got:** Click + dropdown → Select "AI Research Platform"

2. **Arrow next to "New terminal" shows repo list**
   - **Got:** Dropdown menu with all repos listed

3. **"Connect to existing terminal" shows active tmux sessions**
   - **Got:** "Attach to tmux session" option shows interactive menu

4. **Box pops up to name the session**
   - **Got:** Terminal prompts for custom name (5-second timeout)

5. **Automatically starts Claude**
   - **Got:** Prompts "Start Claude? [Y/n]" (auto-yes after 3 seconds)

### ⚠️ Limitations:

**VS Code doesn't support:**
- True right-click context menus for terminals
- Graphical popup dialogs from terminal profiles

**Workaround:**
- Dropdown menu (almost as good as right-click)
- Terminal prompts (instead of GUI popups)
- 5-second timeouts (so you don't wait forever)

---

## Next Steps

**Try it now:**

1. Click the **+ ▼** dropdown in terminal panel
2. Select **"AI Research Platform"**
3. Press Enter for defaults (or customize)
4. Watch it create tmux session and start Claude!

**Then try:**
- Detach with `tmd`
- Click **+ ▼** → **"Attach to tmux session"**
- Your session is still there!

---

**Last Updated:** 2025-10-22
**Maintained By:** myTribe Insurance Development Team
**Files:** `.vscode/settings.json`, `~/bin/tmux-repo`, `~/bin/tmux-attach-menu`

<!-- End of QUICK-TERMINAL-GUIDE.md -->
