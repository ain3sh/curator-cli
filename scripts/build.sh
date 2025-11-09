#!/bin/bash
set -e

echo "🎨 Building Curator..."
echo ""

# Check if --sea flag is provided
if [ "$1" = "--sea" ]; then
  echo "Building SEA (Single Executable Application) binaries..."
  node scripts/build-sea.cjs "$@"
else
  echo "Building JavaScript bundle..."
  npm run build
  echo ""
  echo "✅ Build complete: dist/index.js"
  echo ""
  echo "Usage:"
  echo "  node dist/index.js <url>"
  echo "  or: npm link && curate <url>"
  echo ""
  echo "To build SEA binaries:"
  echo "  ./scripts/build.sh --sea               # All platforms"
  echo "  ./scripts/build.sh --sea --current-only  # Current platform only"
fi
