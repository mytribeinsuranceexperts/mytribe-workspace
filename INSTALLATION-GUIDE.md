# myTribe Development - WSL Ubuntu Installation Guide

**Quick setup guide for installing all dependencies in WSL Ubuntu**

---

## 🚀 Quick Start (Automated Installation)

### Step 1: Switch to WSL Ubuntu

From PowerShell or Windows Terminal:
```powershell
wsl -d Ubuntu
```

### Step 2: Navigate to Workspace

```bash
cd "/home/dev/myTribe Development"
```

### Step 3: Run Installation Script

```bash
bash install-all-deps.sh
```

That's it! The script will:
- ✅ Install Node.js 20.x LTS
- ✅ Install Python 3.12+
- ✅ Install PostgreSQL client libraries
- ✅ Install all npm dependencies (3 repos)
- ✅ Install all Python dependencies (backend)
- ✅ Verify installations

**Estimated time:** 10-15 minutes

---

## 🔧 Manual Installation (If You Prefer)

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install build tools
sudo apt install -y build-essential curl wget git software-properties-common
```

### Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Install Python 3.12+

```bash
# Add PPA
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update

# Install Python
sudo apt install -y python3.12 python3.12-venv python3.12-dev python3-pip

# Set as default
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

# Verify
python3 --version
pip3 --version
```

### Install PostgreSQL Client

```bash
sudo apt install -y postgresql-client libpq-dev
```

### Install Project Dependencies

**1. website-and-cloudflare:**
```bash
cd "/home/dev/myTribe Development/website-and-cloudflare"
npm install
npm run lint
npm test
```

**2. comparison-forms:**
```bash
cd "/home/dev/myTribe Development/comparison-forms"
npm install
npm run type-check
npm test
```

**3. mytribe-ai-research-platform (Frontend):**
```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/frontend"
npm install
npm run type-check
npm test
```

**4. mytribe-ai-research-platform (Backend):**
```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/backend"

# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Verify
python -c "import fastapi; import sqlalchemy; import anthropic; print('✅ Success')"

# Deactivate when done
deactivate
```

---

## 📝 Environment Variables Setup

### website-and-cloudflare

```bash
cd "/home/dev/myTribe Development/website-and-cloudflare"
cp .env.example .env
nano .env  # or code .env
```

Required variables:
- `WEBFLOW_API_KEY`
- `CLOUDFLARE_WORKERS_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ZONE_ID`
- `POSTMARK_API_KEY`

### mytribe-ai-research-platform

```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform"
cp .env.example .env
nano .env  # or code .env
```

Required variables:
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `SECRET_KEY`
- `RAILWAY_ENVIRONMENT` (or similar)

---

## 🧪 Verify Installations

### Node.js Projects

```bash
# website-and-cloudflare
cd "/home/dev/myTribe Development/website-and-cloudflare"
npm test
npm run lint

# comparison-forms
cd "/home/dev/myTribe Development/comparison-forms"
npm test
npm run type-check

# AI Research Platform frontend
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/frontend"
npm test
npm run type-check
```

### Python Backend

```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/backend"
source venv/bin/activate
pytest
deactivate
```

---

## 🎯 Development Workflows

### Starting Development Servers

**website-and-cloudflare:**
```bash
cd "/home/dev/myTribe Development/website-and-cloudflare"
npm run dev
# Opens at http://localhost:5173
```

**comparison-forms:**
```bash
cd "/home/dev/myTribe Development/comparison-forms"
npm run dev
# Opens at http://localhost:5173
```

**AI Research Platform frontend:**
```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/frontend"
npm run dev
# Opens at http://localhost:5173
```

**AI Research Platform backend:**
```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/backend"
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# API at http://localhost:8000
```

---

## 🔄 Using VS Code with WSL

### Option 1: Connect to WSL (Recommended)

1. Open VS Code
2. Press `F1` or `Ctrl+Shift+P`
3. Type: **"WSL: Connect to WSL"**
4. Select **Ubuntu**
5. Open folder: `/home/dev/myTribe Development`

### Option 2: Open from WSL Command Line

```bash
# From WSL Ubuntu terminal
cd "/home/dev/myTribe Development"
code .
```

### VS Code Extensions to Install (in WSL)

- **Remote - WSL** (essential)
- **ESLint** (JavaScript linting)
- **Prettier** (code formatting)
- **Python** (Python support)
- **Pylance** (Python language server)
- **TypeScript Vue Plugin** (TypeScript support)

---

## 🐛 Troubleshooting

### Problem: "command not found" after installation

**Solution:** Reload your shell
```bash
source ~/.bashrc
# or restart terminal
```

### Problem: npm install fails with permission errors

**Solution:** Don't use sudo with npm in your user directory
```bash
# If you accidentally used sudo, fix ownership:
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules
```

### Problem: Python virtual environment activation fails

**Solution:** Make sure you're in the right directory
```bash
cd "/home/dev/myTribe Development/mytribe-ai-research-platform/backend"
ls -la venv  # Should exist
source venv/bin/activate
```

### Problem: Can't access Windows files from WSL

**Note:** This section is for Windows users running WSL. If you're on native Linux, this doesn't apply.

**Solution (WSL users):** Windows drives are mounted at `/mnt/`:
```bash
# C:\ is at /mnt/c/
# D:\ is at /mnt/d/
cd /home/dev/
```

### Problem: PostgreSQL connection fails

**Solution:** Check Railway/Cloud SQL connection settings
```bash
# Test connection
psql "$DATABASE_URL"
# Check .env file has correct DATABASE_URL
cat .env | grep DATABASE_URL
```

---

## 📚 Additional Resources

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [VS Code WSL Tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)
- [Node.js on WSL](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl)
- [Python on WSL](https://learn.microsoft.com/en-us/windows/python/web-frameworks)

---

## 🎉 Next Steps

After installation:

1. ✅ Set up `.env` files with API keys
2. ✅ Run tests to verify everything works
3. ✅ Read each project's `README.md` and `CLAUDE.md`
4. ✅ Review the [Development Wiki](development-wiki/README.md)
5. ✅ Start developing!

---

**Last Updated:** 2025-10-17
**Maintained By:** myTribe Development Team