#!/bin/bash

# Railway CLI - Check Production Variables
# Usage: cd /path/to/mytribe-ai-research-platform && ./check-variables.sh

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║         PRODUCTION ENVIRONMENT VARIABLES - RAILWAY CLI CHECK                  ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Link to project if not already linked
if ! railway status &> /dev/null; then
    echo "🔗 Linking to project..."
    # This will fail in non-interactive mode, but worth trying
    railway link --projectId e0d4482b-5393-40ab-b80c-46a2010e443b 2>/dev/null || true
fi

# Set environment to production
echo "📍 Switching to production environment..."
railway environment production

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "🔍 CRITICAL VARIABLES STATUS:"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Check each critical variable
echo "Checking: ANTHROPIC_API_KEY"
if railway variables | grep -q "ANTHROPIC_API_KEY"; then
    VAL=$(railway variables | grep "ANTHROPIC_API_KEY" | cut -d= -f2 | head -c 15)
    echo "  ✅ SET: ${VAL}..."
else
    echo "  ❌ NOT SET - CRITICAL!"
fi
echo ""

echo "Checking: JWT_SECRET_KEY"
if railway variables | grep -q "JWT_SECRET_KEY"; then
    VAL=$(railway variables | grep "JWT_SECRET_KEY" | cut -d= -f2 | head -c 15)
    echo "  ✅ SET: ${VAL}..."
else
    echo "  ❌ NOT SET - CRITICAL!"
fi
echo ""

echo "Checking: FRONTEND_URL"
if railway variables | grep -q "FRONTEND_URL"; then
    VAL=$(railway variables | grep "FRONTEND_URL" | cut -d= -f2)
    echo "  ✅ SET: ${VAL}"
else
    echo "  ❌ NOT SET - CRITICAL!"
fi
echo ""

echo "Checking: BACKEND_URL"
if railway variables | grep -q "BACKEND_URL"; then
    VAL=$(railway variables | grep "BACKEND_URL" | cut -d= -f2)
    echo "  ✅ SET: ${VAL}"
else
    echo "  ❌ NOT SET - CRITICAL!"
fi
echo ""

echo "Checking: CORS_ORIGINS"
if railway variables | grep -q "CORS_ORIGINS"; then
    VAL=$(railway variables | grep "CORS_ORIGINS" | cut -d= -f2)
    echo "  ✅ SET: ${VAL}"
else
    echo "  ❌ NOT SET - CRITICAL!"
fi
echo ""

echo "Checking: DATABASE_URL"
if railway variables | grep -q "DATABASE_URL"; then
    VAL=$(railway variables | grep "DATABASE_URL" | cut -d= -f2 | head -c 30)
    echo "  ✅ SET: ${VAL}..."
else
    echo "  ❌ NOT SET - CRITICAL!"
fi
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "📋 ALL VARIABLES:"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

railway variables

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "✅ Check complete!"
echo "════════════════════════════════════════════════════════════════════════════════"
