#!/bin/bash
set -e

# Curator installation script

REPO="ain3sh/curator"
BINARY_NAME="curate"
INSTALL_DIR="$HOME/.local/bin"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🎨 Installing Curator CLI..."

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  linux*)
    OS="linux"
    ;;
  darwin*)
    OS="darwin"
    ;;
  msys*|mingw*|cygwin*)
    OS="windows"
    BINARY_NAME="curate.exe"
    ;;
  *)
    echo -e "${RED}✗ Unsupported OS: $OS${NC}"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64|amd64)
    ARCH="x64"
    ;;
  arm64|aarch64)
    ARCH="arm64"
    ;;
  *)
    echo -e "${RED}✗ Unsupported architecture: $ARCH${NC}"
    exit 1
    ;;
esac

BINARY="curator-${OS}-${ARCH}"
if [ "$OS" = "windows" ]; then
  BINARY="${BINARY}.exe"
fi

echo "Platform: ${OS}-${ARCH}"

# Get latest release
echo "Fetching latest release..."
RELEASE_URL="https://api.github.com/repos/${REPO}/releases/latest"
DOWNLOAD_URL=$(curl -s "$RELEASE_URL" | grep "browser_download_url.*${BINARY}" | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo -e "${RED}✗ Could not find release for ${OS}-${ARCH}${NC}"
  echo "Available at: https://github.com/${REPO}/releases"
  exit 1
fi

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download binary
echo "Downloading curator..."
curl -L -o "${INSTALL_DIR}/${BINARY_NAME}" "$DOWNLOAD_URL"
chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

echo -e "${GREEN}✓ Curator installed successfully!${NC}"
echo ""

# Check if in PATH
if [[ ":$PATH:" == *":$INSTALL_DIR:"* ]]; then
  echo -e "${GREEN}✓ $INSTALL_DIR is in your PATH${NC}"
else
  echo -e "${YELLOW}⚠ Add $INSTALL_DIR to your PATH:${NC}"
  echo ""
  echo "  # Add to ~/.bashrc or ~/.zshrc:"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
fi

echo "Get started:"
echo "  curate https://example.com"
echo ""
echo "Get your API key at: https://firecrawl.dev"
