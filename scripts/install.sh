#!/bin/bash
# Curator installer - installs curator-cli via npm
# Usage: curl -fsSL https://www.ain3sh.com/curator/install.sh | bash

set -e

echo "🎨 Curator installer"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  echo ""
  echo "Curator requires Node.js 18 or higher."
  echo ""
  echo "Install Node.js:"
  echo "  • macOS: brew install node"
  echo "  • Ubuntu/Debian: sudo apt install nodejs npm"
  echo "  • Other: https://nodejs.org"
  echo ""
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js $NODE_VERSION is too old"
  echo ""
  echo "Curator requires Node.js 18 or higher."
  echo "Current version: $(node -v)"
  echo ""
  echo "Update Node.js:"
  echo "  • macOS: brew upgrade node"
  echo "  • Ubuntu/Debian: https://github.com/nodesource/distributions"
  echo "  • Other: https://nodejs.org"
  echo ""
  exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  echo ""
  echo "npm should come with Node.js. Please reinstall Node.js."
  exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install curator-cli globally
echo "📦 Installing curator-cli from npm..."
echo ""

if npm install -g curator-cli; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✨ Curator installed successfully!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Get started:"
  echo "  curate https://example.com"
  echo ""
  echo "View all commands:"
  echo "  curate --help"
  echo ""
  echo "Get your Firecrawl API key at:"
  echo "  https://firecrawl.dev"
  echo ""
else
  echo ""
  echo "❌ Installation failed"
  echo ""
  echo "Try installing manually:"
  echo "  npm install -g curator-cli"
  echo ""
  echo "If you get permission errors, try:"
  echo "  sudo npm install -g curator-cli"
  echo ""
  echo "Or install without sudo:"
  echo "  mkdir -p ~/.npm-global"
  echo "  npm config set prefix '~/.npm-global'"
  echo "  echo 'export PATH=~/.npm-global/bin:\$PATH' >> ~/.bashrc"
  echo "  source ~/.bashrc"
  echo "  npm install -g curator-cli"
  echo ""
  exit 1
fi
