# tmux + Claude Code: Web Browser (VS Code Server) Guide

**For:** VS Code Server accessed through web browser (not desktop app)
**Issue:** Browser intercepts keyboard shortcuts like Ctrl+A, making tmux prefix keys not work
**Solution:** Use command-line tmux controls instead of keyboard shortcuts

---

## Quick Reference: Command-Based tmux Control

**Instead of keyboard shortcuts, use these commands:**

| Action | Command | Old Keyboard Shortcut |
|--------|---------|----------------------|
| Start session | `tms` or `tmux new-session -A -s main` | N/A |
| Detach | `tmd` or `tmux detach` | Ctrl+A then D |
| Attach | `tma main` or `tmux attach -t main` | N/A |
| List sessions | `tml` or `tmux ls` | Ctrl+A then S |
| Kill session | `tmk main` or `tmux kill-session -t main` | N/A |

**New shortcuts added to your `.bashrc`:**
- `tms` - Start/attach to main session
- `tmd` - Detach from current session
- `tma <name>` - Attach to session by name
- `tml` - List all sessions
- `tmk <name>` - Kill session by name
- `tc` - Start Claude in tmux session (combo command)

---

## Your Workflow: Office → Phone (Web Browser Version)

### Step 1: Start tmux + Claude (At Office in Browser)

**Open VS Code Server terminal and run:**

```bash
# Option A: Simple - auto Claude session
tc

# Option B: Manual control
tms          # Start tmux "main" session
claude       # Launch Claude
```

### Step 2: Give Claude a Task

```
Claude, please analyze the entire mytribe-ai-research-platform codebase
and create comprehensive architecture documentation. Work autonomously.
```

### Step 3: Detach (Leave Office)

**In the VS Code Server terminal, type:**

```bash
tmd
```

**Or open a NEW terminal tab in VS Code and type:**

```bash
tmux detach-client -t main
```

**You can now:**
- Close the browser tab
- Shut down your computer
- Leave the office

**tmux session keeps running on the server!**

### Step 4: Reconnect from Phone

**SSH to your server:**

```bash
ssh dev@your-server-address
```

**List active sessions:**

```bash
tml
# or
tmux ls
```

**Reattach to your session:**

```bash
tma main
# or
tmux attach -t main
```

**Your Claude conversation is exactly where you left it!**

---

## Detailed Examples

### Example 1: Quick Claude Session

```bash
# In VS Code Server terminal:
tc

# Claude starts automatically in tmux
# Do your work...

# When done, detach:
tmd

# Later (from phone or anywhere):
ssh dev@server
tma claude
```

### Example 2: Named Sessions for Different Tasks

```bash
# Create session for backend work
tmux new -s backend
claude
"Work on API endpoints..."
tmd

# Create session for frontend work
tmux new -s frontend
claude
"Update React components..."
tmd

# List all sessions
tml
# Shows:
# backend: 1 windows
# frontend: 1 windows

# Reconnect to specific one
tma backend
```

### Example 3: Multiple Terminals Within tmux

**Since browser shortcuts don't work, use commands:**

```bash
# Start session
tms

# From tmux command mode (Ctrl+A then :)
# Type: split-window -h
# This splits panes horizontally

# Or just open multiple tmux sessions instead:
tmux new -s task1
tmux new -s task2
tmux new -s task3
```

---

## Keyboard Shortcuts That DO Work in Browser

**Some shortcuts still work in VS Code Server:**

| Action | Shortcut | Works? |
|--------|----------|--------|
| Open terminal | Ctrl+` | ✅ Yes |
| New terminal | Ctrl+Shift+` | ✅ Yes |
| Close terminal | Ctrl+D (in terminal) | ✅ Yes |
| Split terminal | Ctrl+\ | ✅ Yes (VS Code split, not tmux) |
| Claude Code | Ctrl+Escape | ✅ Yes |

**tmux shortcuts (Ctrl+A prefix) generally DON'T work in browser**

---

## Advanced: Mouse Mode in tmux

**Your tmux config has mouse mode enabled, which is GREAT for browser usage!**

**What you CAN do with mouse:**
- Click between panes (if using split screen)
- Scroll up/down in terminal output
- Select text for copying
- Resize panes by dragging borders

**Test it:**

```bash
# Start tmux
tms

# Run a command with lots of output
ls -la /usr/bin

# Try scrolling with mouse wheel
# Try selecting text with mouse
```

---

## Alternative: Use tmux Command Mode

**If you really want keyboard control in browser:**

1. Press `Ctrl+A` then `:` (colon)
   - This opens tmux command prompt at bottom

2. Type tmux commands directly:
   - `detach` - Detach from session
   - `split-window -h` - Split panes horizontally
   - `split-window -v` - Split panes vertically
   - `kill-pane` - Close current pane
   - `new-window` - Create new window

3. Press Enter to execute

**Example:**
```
Ctrl+A : detach [Enter]
```

---

## Troubleshooting Web Browser Issues

### Issue: Ctrl+A Does Nothing

**Cause:** Browser intercepts the keystroke

**Solutions:**
1. Use command mode: Type commands instead of shortcuts
2. Use aliases: `tmd` instead of `Ctrl+A then D`
3. Access via SSH from terminal app (not browser)

### Issue: Can't Paste into Browser Terminal

**Solutions:**
- Right-click → Paste
- Ctrl+Shift+V (not Ctrl+V)
- Browser's paste from menu

### Issue: Terminal Looks Weird in tmux

**Cause:** TERM=dumb in browser

**Solution:**
```bash
# Add to ~/.bashrc
if [[ "$TERM" == "dumb" ]]; then
    export TERM=xterm-256color
fi
```

Then reload terminal or run:
```bash
export TERM=xterm-256color
```

### Issue: Mouse Scrolling Not Working in tmux

**Try:**
1. Enter tmux copy mode: `Ctrl+A [` (if this works)
2. Or use command mode: `Ctrl+A : copy-mode [Enter]`
3. Then scroll with arrow keys
4. Press `q` to exit copy mode

---

## Recommended: Use Both Methods

**For best experience with VS Code Server:**

1. **In Browser (Office):**
   - Use command aliases (`tms`, `tmd`, `tc`)
   - Start Claude, give tasks, detach
   - Quick and easy

2. **From Phone (Mobile SSH):**
   - Use full SSH client (Termux, JuiceSSH)
   - Better keyboard support
   - Proper terminal emulation
   - tmux shortcuts work normally

3. **From Home (Desktop SSH):**
   - Terminal app with SSH
   - Full tmux keyboard shortcuts work
   - Best experience

---

## Quick Command Cheat Sheet (For Phone Notes)

```bash
# === tmux + Claude Quick Commands ===

# START
tc                          # Quick Claude in tmux
tms                         # Start main session
tmux new -s name           # Named session

# DETACH
tmd                         # Detach current
tmux detach                # Full command

# ATTACH
tma main                   # Attach to main
tmux attach -t name        # Attach to named

# LIST
tml                         # List sessions
tmux ls                    # Full command

# KILL
tmk name                   # Kill session
tmux kill-session -t name  # Full command

# CLAUDE
claude                     # Start Claude CLI
Ctrl+Escape               # Start Claude from VS Code
```

---

## Testing Your Setup Right Now

**Let's verify everything works:**

```bash
# 1. Start tmux session
tms

# 2. You should see tmux status bar at bottom
# 3. Start Claude
claude

# 4. Give simple test:
"Count to 10 slowly"

# 5. Open NEW terminal in VS Code (Ctrl+Shift+`)
# 6. In new terminal, detach the session:
tmux detach-client -t main

# 7. First terminal should close/detach
# 8. Reattach:
tma main

# 9. Claude should still be counting!
```

**If this works, you're all set!** ✅

---

## Summary: Key Differences from Desktop VS Code

| Feature | Desktop VS Code | VS Code Server (Browser) |
|---------|----------------|--------------------------|
| tmux keyboard shortcuts | ✅ Work | ❌ Often blocked by browser |
| tmux command mode | ✅ Works | ✅ Works |
| Command-line tmux | ✅ Works | ✅ Works |
| Mouse support | ✅ Works | ✅ Works (sometimes better!) |
| Auto-tmux terminal | ✅ Works | ⚠️ May need manual start |
| Claude Ctrl+Escape | ✅ Works | ✅ Works |

**Bottom line:** Use command-line tmux controls (`tms`, `tmd`, `tma`) instead of keyboard shortcuts in browser.

---

## Files Modified for Browser Support

| File | Addition | Purpose |
|------|----------|---------|
| `~/.bashrc` | tmux aliases (tms, tmd, etc.) | Easy command-based control |
| `~/.bashrc` | TERM fix for browser | Better terminal compatibility |

---

**Last Updated:** 2025-10-22
**For:** VS Code Server (code-server) in web browser
**Maintained By:** myTribe Insurance Development Team

<!-- End of TMUX-WEB-BROWSER-GUIDE.md -->
