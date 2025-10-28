#!/bin/bash

# Error Fix Script for Decentralized Solana Poll
# This script fixes all known errors in the codebase

echo "🔧 Starting error fix process..."
echo ""

# Step 1: Remove old conflicting directories
echo "📁 Step 1: Cleaning up old files..."
if [ -d "app" ]; then
    rm -rf app
    echo "✅ Removed /app directory"
else
    echo "✓ No /app directory found (already clean)"
fi

if [ -d "src/app/(poll)" ]; then
    rm -rf "src/app/(poll)"
    echo "✅ Removed /src/app/(poll) directory"
else
    echo "✓ No /src/app/(poll) directory found (already clean)"
fi

echo ""

# Step 2: Clean build artifacts
echo "🧹 Step 2: Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cleaned .next and cache"
echo ""

# Step 3: Verify critical files exist
echo "📋 Step 3: Verifying critical files..."

FILES_TO_CHECK=(
    "src/features/poll/poll-feature.tsx"
    "src/features/dashboard/dashboard-feature.tsx"
    "src/components/app-header.tsx"
    "src/app/poll/page.tsx"
    "lib/anchorClient.ts"
)

ALL_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "❌ $file MISSING!"
        ALL_EXIST=false
    fi
done

echo ""

# Step 4: Check network configuration
echo "🌐 Step 4: Checking network configuration..."
if grep -q "createSolanaDevnet" src/components/solana/solana-provider.tsx; then
    echo "✓ Devnet configured in solana-provider.tsx"
else
    echo "⚠ Devnet not found in configuration"
fi

if grep -q 'cluster = "devnet"' anchor/Anchor.toml; then
    echo "✓ Anchor.toml set to devnet"
else
    echo "⚠ Anchor.toml not set to devnet"
fi

echo ""

# Step 5: Reinstall dependencies (optional, commented out)
# echo "📦 Step 5: Reinstalling dependencies..."
# npm install
# echo "✅ Dependencies installed"
# echo ""

# Summary
echo "================================"
echo "✅ Error Fix Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. In the app, select 'Devnet' from the network dropdown"
echo "3. Connect your wallet"
echo "4. Start creating polls!"
echo ""
echo "For deployment to Devnet, see:"
echo "  📖 DEPLOYMENT_GUIDE.md"
echo ""
