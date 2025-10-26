# tmux + Claude Code: Mobile Reconnection Workflow

**Use Case:** Start Claude working on a task at the office, leave, reconnect from your phone later

**Status:** ✅ Fully Configured and Ready to Use

---

## Quick Start: Your Exact Workflow

### Step 1: Start Claude in Persistent tmux Session (At Office)

**Option A: Using VS Code Terminal (Recommended)**

1. Open VS Code terminal (`Ctrl+\``)
   - Automatically connects to tmux "main" session
   - Or creates it if it doesn't exist

2. Launch Claude in terminal mode:
   - Press `Ctrl+Escape` (launches Claude CLI in terminal)
   - Or type: `claude`

3. Give Claude a task:
   ```
   Claude, please analyze the entire codebase and create a comprehensive
   architecture document. This will take a while, so work on it
   autonomously.
   ```

4. **Detach from tmux:**
   - Press `Ctrl+a` then `d`
   - **OR** just close VS Code - tmux keeps running!

**Option B: Using Wrapper Script**

```bash
# Start managed session with logging
claude-tmux

# Inside, Claude is ready - give it a task
# Then detach: Ctrl+a then d
```

**Option C: Manual tmux Session**

```bash
# Create named session
tmux new -s claude-work

# Launch Claude
claude

# Give task, then detach: Ctrl+a then d
```

---

### Step 2: Leave the Office

**What happens:**
- tmux session keeps running on the server
- Claude continues working on the task
- Your conversation history is preserved
- All terminal output is maintained

**Important:** Your server must stay on (don't shut down the machine)

---

### Step 3: Reconnect from Your Phone

**Prerequisites:**
- SSH access to your server
- SSH client app on phone (recommended apps below)
- Network access to server (VPN if needed)

#### Recommended Mobile SSH Apps

**Android:**
- **Termux** (Free, powerful) - https://termux.dev/en/
- **JuiceSSH** (User-friendly)
- **ConnectBot** (Open source)

**iOS:**
- **Terminus** (Free, modern UI)
- **Blink Shell** (Powerful, paid)
- **Secure ShellFish** (Files + Terminal)

#### Reconnection Steps (Phone)

1. **Open SSH app**

2. **Connect to your server:**
   ```bash
   ssh dev@your-server-address
   ```

3. **List active tmux sessions:**
   ```bash
   tmux ls
   ```

   You'll see something like:
   ```
   main: 1 windows (created Tue Oct 22 14:00:00 2025)
   claude-work: 1 windows (created Tue Oct 22 13:30:00 2025)
   ```

4. **Reattach to your session:**
   ```bash
   # If using VS Code default session
   tmux attach -t main

   # If using claude-tmux wrapper
   tmux attach -t claude-work

   # Or use the wrapper
   claude-tmux attach
   ```

5. **Your Claude session is exactly where you left it!**
   - Scroll up to see what Claude has done
   - Continue the conversation
   - Give new instructions

---

## Complete Workflow Example

### Morning at Office (Desktop/Laptop)

```bash
# Open VS Code terminal (auto-connects to tmux)
# OR manually:
tmux new -s morning-work

# Start Claude
claude

# Give task:
"Claude, please:
1. Run all tests in the mytribe-ai-research-platform
2. Fix any failing tests
3. Update the documentation
4. Create a summary report

Work autonomously - I'll check back later."

# Detach (keeps running)
Ctrl+a then d

# Close laptop, leave office
```

### Lunchtime (Phone - Check Progress)

```bash
# SSH from phone
ssh dev@your-server

# Reconnect
tmux attach -t morning-work

# Check what Claude has done
# Scroll through output
# Give new instructions if needed

# Detach again
Ctrl+a then d

# Disconnect SSH
exit
```

### Evening at Home (Any Device)

```bash
# SSH from home computer/laptop
ssh dev@your-server

# Reconnect
tmux attach -t morning-work

# Review final results
# Continue working or close session
```

---

## Essential tmux Commands (Phone-Friendly)

### Navigation in tmux (Touch-Friendly)

| Action | Keys | Phone Tip |
|--------|------|-----------|
| Detach | `Ctrl+a` then `d` | Use on-screen keyboard |
| Scroll up | `Ctrl+a` then `[` then arrow keys | Or swipe if supported |
| Exit scroll | `q` | Simple tap |
| Copy text | `Ctrl+a` then `[`, `v`, select, `y` | Use mouse mode |

### Session Management (Command Line)

```bash
# List all sessions
tmux ls

# Attach to specific session
tmux attach -t session-name

# Short version
tmux a -t session-name

# Kill session when done
tmux kill-session -t session-name

# Rename session
tmux rename-session -t old-name new-name
```

---

## Advanced: Mouse Support on Phone

**Your tmux config already has mouse support enabled!**

**What this means on phone SSH apps:**
- Many SSH apps support mouse events
- You can scroll by swiping
- Tap to switch panes (if split screen)
- Select text by touch

**Test it:**
1. Connect to tmux session
2. Try swiping up/down to scroll
3. If it doesn't work, enter copy mode: `Ctrl+a` then `[`

---

## Server Access Setup for Phone

### Option 1: Direct SSH (Simplest)

**Requirements:**
- Server has public IP or domain name
- SSH port (22) accessible from internet
- Strong password or SSH keys

**Connect:**
```bash
ssh dev@your-server-ip-or-domain
```

### Option 2: VPN (Most Secure)

**If your server is on private network:**
1. Set up VPN to office network (WireGuard, OpenVPN, Tailscale)
2. Connect phone to VPN
3. SSH to server's private IP

**Tailscale (Recommended - Super Easy):**
- Install Tailscale on server: https://tailscale.com/download
- Install Tailscale app on phone
- Both connect to same Tailscale network
- SSH using Tailscale IP (100.x.x.x)

### Option 3: VS Code Server Web UI

**Alternative to SSH:**
- Access VS Code Server through browser on phone
- URL: `https://your-server:port`
- Open terminal in browser
- Use tmux commands same way

---

## Security Best Practices

### SSH Key Authentication (Recommended)

**Instead of password:**

1. **Generate SSH key on phone (if using Termux):**
   ```bash
   ssh-keygen -t ed25519 -C "phone-key"
   ```

2. **Copy public key to server:**
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub dev@your-server
   ```

3. **Now connect without password:**
   ```bash
   ssh dev@your-server
   ```

### Session Security

**Prevent others from attaching to your tmux sessions:**
```bash
# Check permissions
ls -la /tmp/tmux-1000/

# If needed, restrict access
chmod 700 /tmp/tmux-1000/
```

---

## Troubleshooting Mobile Access

### Issue: Can't Connect to Server from Phone

**Check:**
1. Server is on and running
2. SSH service is running: `sudo systemctl status ssh`
3. Firewall allows SSH (port 22)
4. Using correct IP/domain
5. Using correct username

**Test from office first:**
```bash
# From another computer on same network
ssh dev@server-ip
```

### Issue: tmux Session Not Found

**Possible causes:**
1. Session was killed
2. Server was restarted (tmux doesn't survive reboots)
3. Wrong session name

**Solution:**
```bash
# List all sessions
tmux ls

# If empty, session was lost - create new one
tmux new -s recovery
```

### Issue: Claude Session Lost After Server Reboot

**tmux does NOT survive server reboots**

**Workarounds:**
1. **Prevent server from auto-sleeping/rebooting**
2. **Use tmux-resurrect plugin** (saves/restores sessions)
3. **Document progress** - Have Claude write status updates to files

**Quick setup for tmux-resurrect:**
```bash
# Install
git clone https://github.com/tmux-plugins/tmux-resurrect ~/.tmux/plugins/tmux-resurrect

# Add to ~/.tmux.conf
echo "run-shell ~/.tmux/plugins/tmux-resurrect/resurrect.tmux" >> ~/.tmux.conf

# Reload tmux config
tmux source-file ~/.tmux.conf

# Save session: Ctrl+a then Ctrl+s
# Restore after reboot: Ctrl+a then Ctrl+r
```

### Issue: Phone SSH App Disconnects Too Quickly

**Keep-alive settings:**

In SSH config (`~/.ssh/config`):
```bash
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

In phone SSH app settings:
- Enable "Keep connection alive"
- Set ping interval (usually 60 seconds)

---

## Optimizing for Phone Use

### Use Session Names You'll Remember

```bash
# Instead of generic names:
tmux new -s work

# Use descriptive names:
tmux new -s "claude-api-refactor"
tmux new -s "database-migration"
tmux new -s "testing-fixes"
```

### Create Aliases for Quick Access

Add to `~/.bashrc`:
```bash
# Quick tmux shortcuts
alias tm='tmux'
alias tma='tmux attach -t'
alias tml='tmux ls'
alias tmn='tmux new -s'

# Quick Claude access
alias tc='tmux attach -t main || tmux new -s main -c ~ "claude"'
```

Then from phone:
```bash
# Just type:
tc
# Instantly connects to Claude in tmux!
```

### Set Up Server-Side Logging

**So you can review what happened even if session dies:**

Create wrapper script `~/bin/claude-logged`:
```bash
#!/bin/bash
LOG_FILE=~/.claude-logs/$(date +%Y-%m-%d-%H%M%S).log
script -f -c "claude" "$LOG_FILE"
```

Use it:
```bash
tmux new -s logged
claude-logged
# All output saved to timestamped log file
```

---

## Real-World Scenarios

### Scenario 1: Long Database Migration

```bash
# Morning at office
tmux new -s migration
claude

"Claude, please run the database migration script and monitor for errors.
If any issues occur, document them and attempt to fix.
Script location: backend/scripts/migrate.py"

Ctrl+a then d

# Afternoon from phone
ssh dev@server
tmux attach -t migration
# Check if migration completed
# Review any errors Claude found
```

### Scenario 2: Test Suite Debugging

```bash
# Start at office
tmux new -s testing
claude

"Please run the full test suite, identify all failing tests,
and create fixes for each one. Test each fix before moving on."

Ctrl+a then d

# Check from phone during commute
tmux attach -t testing
# See progress, how many tests fixed
```

### Scenario 3: Code Review Task

```bash
# Before leaving office
claude-tmux
"Review all changes in the last 10 commits and create a
comprehensive code review document with:
- Security issues
- Performance concerns
- Best practice violations
- Suggestions for improvement"

Ctrl+a then d

# Review results from home later
claude-tmux attach
```

---

## Quick Reference Card (Save to Phone)

```
🔐 CONNECT TO SERVER
ssh dev@your-server-address

📋 LIST TMUX SESSIONS
tmux ls

🔌 ATTACH TO SESSION
tmux attach -t session-name
tmux a -t main

🤖 START CLAUDE IN TMUX
tmux new -s work
claude

⏸️ DETACH (KEEPS RUNNING)
Ctrl+a then d

📜 SCROLL/REVIEW OUTPUT
Ctrl+a then [
(arrow keys to scroll)
q to exit

❌ KILL SESSION WHEN DONE
tmux kill-session -t session-name

🔄 QUICK REATTACH
claude-tmux attach
(if using wrapper script)
```

---

## Next Steps to Try

**Test the full workflow right now:**

1. **Open VS Code terminal** (auto-connects to tmux "main")

2. **Start Claude:**
   ```bash
   claude
   ```

3. **Give simple test task:**
   ```
   Claude, please count to 50 slowly, with a 2-second pause between each number.
   ```

4. **Detach while counting:**
   ```
   Ctrl+a then d
   ```

5. **Wait 20 seconds, then reattach:**
   ```bash
   tmux attach -t main
   ```

6. **Verify:** Claude is still counting! The session persisted!

7. **Exit Claude:** `Ctrl+C` or type `/exit`

---

## Limitations & Important Notes

### What DOES Persist:
✅ tmux sessions (until server reboot)
✅ Claude conversation history
✅ Terminal output/scrollback
✅ Running processes
✅ File edits Claude made

### What DOES NOT Persist:
❌ Sessions across server reboots
❌ VS Code GUI state (sidebar, panels)
❌ Network connections (need to SSH again)
❌ Clipboard contents

### Server Uptime Required:
- Your Linux server must stay running
- If server restarts, tmux sessions are lost
- Consider UPS for power protection
- Enable auto-start for critical services

---

## Additional Tools for Mobile Workflow

### File Transfer (If Needed)

**scp from phone (Termux):**
```bash
scp dev@server:/path/to/file ~/download/
```

**Or use SFTP client apps:**
- **Android:** Solid Explorer, FX File Explorer
- **iOS:** Secure ShellFish, FileZilla

### Notifications

**Get notified when long task completes:**

```bash
# At end of command
claude && curl -X POST https://ntfy.sh/mytopic -d "Claude finished!"

# Or use pushover, telegram bot, etc.
```

---

## Summary: Your Setup is Ready!

✅ **tmux installed and configured**
✅ **Claude Code terminal mode working**
✅ **VS Code auto-connects to tmux**
✅ **PATH configured for mobile access**
✅ **Wrapper scripts available**

**You can now:**
1. Start Claude working on a task at office
2. Detach from the session (`Ctrl+a` then `d`)
3. Leave the office
4. SSH from your phone
5. Reattach to the session (`tmux attach -t main`)
6. Claude is exactly where you left it!

---

**Questions?** Test it out with a simple task first. Once you're comfortable, try longer-running tasks.

**Last Updated:** 2025-10-22
**Maintained By:** myTribe Insurance Development Team

<!-- End of TMUX-CLAUDE-MOBILE-WORKFLOW.md -->
