#!/bin/bash
# ============================================================================
# myTribe Development Workspace - Dependency Installation Script
# ============================================================================
# Purpose: Install all dependencies for all 3 repositories in WSL Ubuntu
# - website-and-cloudflare (Node.js)
# - comparison-forms (Node.js)
# - mytribe-ai-research-platform (Node.js + Python)
#
# Usage: bash install-all-deps.sh
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in WSL
check_wsl() {
    if ! grep -q Microsoft /proc/version 2>/dev/null; then
        print_error "This script must be run in WSL Ubuntu!"
        print_info "Run: wsl -d Ubuntu"
        exit 1
    fi
    print_success "Running in WSL Ubuntu"
}

# Get workspace directory
WORKSPACE_DIR="/mnt/c/Users/chris/myTribe Development"
if [ ! -d "$WORKSPACE_DIR" ]; then
    print_error "Workspace directory not found: $WORKSPACE_DIR"
    exit 1
fi

cd "$WORKSPACE_DIR"
print_success "Working directory: $WORKSPACE_DIR"

# ============================================================================
# STEP 1: System Prerequisites
# ============================================================================
print_header "STEP 1: Installing System Prerequisites"

print_info "Updating package lists..."
sudo apt update -y

print_info "Installing build essentials..."
sudo apt install -y build-essential curl wget git software-properties-common

print_success "System prerequisites installed"

# ============================================================================
# STEP 2: Install Node.js 20.x LTS
# ============================================================================
print_header "STEP 2: Installing Node.js 20.x LTS"

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_warning "Node.js already installed: $NODE_VERSION"
    read -p "Do you want to reinstall Node.js 20.x? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
else
    print_info "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js installed: $NODE_VERSION"
print_success "npm installed: $NPM_VERSION"

# ============================================================================
# STEP 3: Install Python 3.12+
# ============================================================================
print_header "STEP 3: Installing Python 3.12+"

# Check if Python 3.12 is already installed
if command -v python3.12 &> /dev/null; then
    PYTHON_VERSION=$(python3.12 --version)
    print_warning "Python 3.12 already installed: $PYTHON_VERSION"
else
    print_info "Adding deadsnakes PPA..."
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt update -y

    print_info "Installing Python 3.12..."
    sudo apt install -y python3.12 python3.12-venv python3.12-dev python3-pip

    print_info "Setting Python 3.12 as default..."
    sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1
fi

# Install pip for Python 3.12 if not present
if ! python3 -m pip --version &> /dev/null; then
    print_info "Installing pip for Python 3.12..."
    sudo apt install -y python3-pip

    # Upgrade pip to latest version
    python3 -m pip install --user --upgrade pip
fi

# Verify Python installation
PYTHON_VERSION=$(python3 --version)
PIP_VERSION=$(python3 -m pip --version)
print_success "Python installed: $PYTHON_VERSION"
print_success "pip installed: $PIP_VERSION"

# ============================================================================
# STEP 4: Install PostgreSQL Client Libraries
# ============================================================================
print_header "STEP 4: Installing PostgreSQL Client Libraries"

print_info "Installing PostgreSQL client and development libraries..."
sudo apt install -y postgresql-client libpq-dev

print_success "PostgreSQL client libraries installed"

# ============================================================================
# STEP 5: Install Dependencies - website-and-cloudflare
# ============================================================================
print_header "STEP 5: Installing Dependencies - website-and-cloudflare"

cd "$WORKSPACE_DIR/website-and-cloudflare"

if [ ! -f "package.json" ]; then
    print_error "package.json not found in website-and-cloudflare!"
    exit 1
fi

print_info "Running npm install..."
npm install

print_info "Running lint check..."
npm run lint || print_warning "Lint check had warnings (this is OK)"

print_success "website-and-cloudflare dependencies installed"

# ============================================================================
# STEP 6: Install Dependencies - comparison-forms
# ============================================================================
print_header "STEP 6: Installing Dependencies - comparison-forms"

cd "$WORKSPACE_DIR/comparison-forms"

if [ ! -f "package.json" ]; then
    print_error "package.json not found in comparison-forms!"
    exit 1
fi

print_info "Running npm install..."
npm install

print_info "Running type check..."
npm run type-check || print_warning "Type check had errors (may need configuration)"

print_success "comparison-forms dependencies installed"

# ============================================================================
# STEP 7: Install Dependencies - mytribe-ai-research-platform (Frontend)
# ============================================================================
print_header "STEP 7: Installing Dependencies - AI Research Platform (Frontend)"

cd "$WORKSPACE_DIR/mytribe-ai-research-platform/frontend"

if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend!"
    exit 1
fi

print_info "Running npm install..."
npm install

print_info "Running type check..."
npm run type-check || print_warning "Type check had errors (may need configuration)"

print_success "AI Research Platform frontend dependencies installed"

# ============================================================================
# STEP 8: Install Dependencies - mytribe-ai-research-platform (Backend)
# ============================================================================
print_header "STEP 8: Installing Dependencies - AI Research Platform (Backend)"

cd "$WORKSPACE_DIR/mytribe-ai-research-platform/backend"

if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found in backend!"
    exit 1
fi

print_info "Creating Python virtual environment..."
python3 -m venv venv

print_info "Activating virtual environment..."
source venv/bin/activate

print_info "Upgrading pip, setuptools, wheel..."
python3 -m pip install --upgrade pip setuptools wheel

print_info "Installing Python dependencies (this may take a few minutes)..."
python3 -m pip install -r requirements.txt

print_info "Verifying Python imports..."
python -c "import fastapi; import sqlalchemy; import anthropic; print('✅ All critical imports successful')" || print_warning "Some imports failed (may need configuration)"

print_success "AI Research Platform backend dependencies installed"

deactivate
print_info "Virtual environment deactivated"

# ============================================================================
# STEP 9: Environment Variables Setup Reminder
# ============================================================================
print_header "STEP 9: Environment Variables Setup"

print_warning "IMPORTANT: You need to set up .env files for your projects!"

echo ""
print_info "For website-and-cloudflare:"
echo "  cd '$WORKSPACE_DIR/website-and-cloudflare'"
echo "  cp .env.example .env"
echo "  # Edit .env with your API keys"

echo ""
print_info "For mytribe-ai-research-platform:"
echo "  cd '$WORKSPACE_DIR/mytribe-ai-research-platform'"
echo "  cp .env.example .env"
echo "  # Edit .env with your API keys"

# ============================================================================
# SUMMARY
# ============================================================================
print_header "🎉 INSTALLATION COMPLETE!"

echo ""
print_success "System Tools:"
echo "  - Node.js: $NODE_VERSION"
echo "  - npm: $NPM_VERSION"
echo "  - Python: $PYTHON_VERSION"
echo "  - pip: $PIP_VERSION"

echo ""
print_success "Dependencies Installed For:"
echo "  ✅ website-and-cloudflare (Node.js)"
echo "  ✅ comparison-forms (Node.js + TypeScript)"
echo "  ✅ mytribe-ai-research-platform/frontend (React + TypeScript)"
echo "  ✅ mytribe-ai-research-platform/backend (Python + FastAPI)"

echo ""
print_warning "NEXT STEPS:"
echo "  1. Set up .env files (see above)"
echo "  2. Review each project's README.md"
echo "  3. Run tests to verify everything works"
echo "  4. Start development!"

echo ""
print_info "Test Commands:"
echo "  # website-and-cloudflare"
echo "  cd '$WORKSPACE_DIR/website-and-cloudflare' && npm test"
echo ""
echo "  # comparison-forms"
echo "  cd '$WORKSPACE_DIR/comparison-forms' && npm test"
echo ""
echo "  # AI Research Platform frontend"
echo "  cd '$WORKSPACE_DIR/mytribe-ai-research-platform/frontend' && npm test"
echo ""
echo "  # AI Research Platform backend"
echo "  cd '$WORKSPACE_DIR/mytribe-ai-research-platform/backend' && source venv/bin/activate && pytest"

echo ""
print_success "Happy coding! 🚀"

cd "$WORKSPACE_DIR"