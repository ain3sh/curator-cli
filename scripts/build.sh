#!/bin/bash
set -e

echo "🔨 Building Curator binaries..."

# Build JavaScript bundle first
npm run build

# TODO: Node.js SEA (Single Executable Application) support
# This requires Node.js 20+ with experimental SEA support
# For now, we'll use the bundled JavaScript

echo ""
echo "✓ Build complete: dist/index.js"
echo ""
echo "For standalone binaries (coming soon):"
echo "  - Linux: curator-linux-x64"
echo "  - macOS Intel: curator-darwin-x64"
echo "  - macOS Apple Silicon: curator-darwin-arm64"
echo "  - Windows: curator-win-x64.exe"
echo ""
echo "Current usage:"
echo "  node dist/index.js <url>"
echo "  or: npm link && curate <url>"
