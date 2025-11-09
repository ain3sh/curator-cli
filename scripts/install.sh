#!/bin/bash
# Curator installer - downloads and installs the appropriate binary
# Usage: curl -fsSL https://www.ain3sh.com/curator/install.sh | bash

set -e

REPO="ain3sh/curator-cli"
INSTALL_DIR="$HOME/.curator/bin"
BINARY_NAME="curate"

echo "🎨 Curator installer"
echo ""

# Detect OS and architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux*)
    PLATFORM="linux"
    ;;
  Darwin*)
    PLATFORM="darwin"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    PLATFORM="win32"
    BINARY_NAME="curate.exe"
    ;;
  *)
    echo "❌ Unsupported OS: $OS"
    echo "Supported: Linux, macOS, Windows"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64|amd64)
    ARCH_NAME="x64"
    ;;
  arm64|aarch64)
    ARCH_NAME="arm64"
    ;;
  *)
    echo "❌ Unsupported architecture: $ARCH"
    echo "Supported: x86_64, arm64"
    exit 1
    ;;
esac

# Special case: macOS arm64 falls back to x64 if arm64 not available
if [ "$PLATFORM" = "darwin" ] && [ "$ARCH_NAME" = "arm64" ]; then
  echo "📍 Detected: macOS Apple Silicon (arm64)"
else
  echo "📍 Detected: $PLATFORM-$ARCH_NAME"
fi

echo ""

# Get latest release
echo "🔍 Fetching latest release..."
LATEST_URL="https://api.github.com/repos/$REPO/releases/latest"
DOWNLOAD_URL=$(curl -s "$LATEST_URL" | grep "browser_download_url.*curate-$PLATFORM-$ARCH_NAME\"" | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "⚠️  Could not find binary for $PLATFORM-$ARCH_NAME"
  echo ""
  echo "Falling back to npm installation..."
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
    exit 1
  fi

  echo "✅ Node.js $(node -v) detected"

  # Check if npm is installed
  if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
  fi

  echo "✅ npm $(npm -v) detected"
  echo ""

  # Install via npm
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
    echo "Get your Firecrawl API key at:"
    echo "  https://firecrawl.dev"
    echo ""
    exit 0
  else
    echo ""
    echo "❌ Installation failed"
    echo ""
    echo "Try installing manually:"
    echo "  npm install -g curator-cli"
    echo ""
    exit 1
  fi
fi

echo "📥 Downloading from GitHub releases..."
echo "   $DOWNLOAD_URL"
echo ""

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download binary
if ! curl -fsSL "$DOWNLOAD_URL" -o "$INSTALL_DIR/$BINARY_NAME"; then
  echo "❌ Download failed"
  exit 1
fi

# Make executable
chmod +x "$INSTALL_DIR/$BINARY_NAME"

echo "✅ Binary installed to: $INSTALL_DIR/$BINARY_NAME"
echo ""

# Add to PATH
# Check if already in PATH
if echo "$PATH" | grep -q ".curator/bin"; then
  echo "✅ curator is already in your PATH"
else
  # Update all existing shell config files
  UPDATED=false

  for SHELL_RC in "$HOME/.zshrc" "$HOME/.bashrc"; do
    if [ -f "$SHELL_RC" ]; then
      if ! grep -q ".curator/bin" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Curator CLI" >> "$SHELL_RC"
        echo "export PATH=\"\$HOME/.curator/bin:\$PATH\"" >> "$SHELL_RC"
        echo "✅ Added curator to PATH in $SHELL_RC"
        UPDATED=true
      fi
    fi
  done

  # If no rc files were updated, try .profile as fallback
  if [ "$UPDATED" = false ]; then
    SHELL_RC="$HOME/.profile"
    if ! grep -q ".curator/bin" "$SHELL_RC" 2>/dev/null; then
      echo "" >> "$SHELL_RC"
      echo "# Curator CLI" >> "$SHELL_RC"
      echo "export PATH=\"\$HOME/.curator/bin:\$PATH\"" >> "$SHELL_RC"
      echo "✅ Added curator to PATH in $SHELL_RC"
      UPDATED=true
    fi
  fi

  if [ "$UPDATED" = true ]; then
    echo ""
    echo "⚡ Run this to update your current shell:"
    if [ -f "$HOME/.zshrc" ]; then
      echo "   source ~/.zshrc"
    elif [ -f "$HOME/.bashrc" ]; then
      echo "   source ~/.bashrc"
    else
      echo "   source ~/.profile"
    fi
  else
    echo "⚠️  Could not add to PATH automatically"
    echo "   Please add this to your shell config:"
    echo "   export PATH=\"\$HOME/.curator/bin:\$PATH\""
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Curator installed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Get started:"
echo "  curate https://example.com"
echo "  curate --help"
echo ""
echo "Get your Firecrawl API key at:"
echo "  https://firecrawl.dev"
echo ""
