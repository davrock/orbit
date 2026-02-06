#!/usr/bin/env bash
# 🛸 ORBIT Installer (Unix/macOS/Linux)
# Installs ORBIT globally without requiring sudo

set -e

ORBIT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🛸 ORBIT Installer"
echo "=================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 16+ first:"
    echo "   https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js $NODE_VERSION found, requires 16+"
    exit 1
fi

cd "$ORBIT_DIR"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building..."
npm run build

# Make CLI executable (TypeScript doesn't preserve permissions)
chmod +x dist/cli/index.js

# Configure npm to use local prefix (no sudo needed)
NPM_PREFIX="${HOME}/.npm-global"
mkdir -p "$NPM_PREFIX"

# Set npm prefix for this install
echo "🔗 Installing globally to $NPM_PREFIX..."
npm config set prefix "$NPM_PREFIX"
npm link

# Check if PATH includes npm global bin
NPM_BIN="$NPM_PREFIX/bin"
if [[ ":$PATH:" != *":$NPM_BIN:"* ]]; then
    echo ""
    echo "⚠️  Add npm global bin to your PATH:"
    echo ""
    
    SHELL_NAME="$(basename "$SHELL")"
    case "$SHELL_NAME" in
        zsh)  RC_FILE="$HOME/.zshrc" ;;
        bash) RC_FILE="$HOME/.bashrc" ;;
        fish) RC_FILE="$HOME/.config/fish/config.fish" ;;
        *)    RC_FILE="your shell config" ;;
    esac
    
    if [ "$SHELL_NAME" = "fish" ]; then
        echo "   echo 'set -gx PATH \$HOME/.npm-global/bin \$PATH' >> $RC_FILE"
    else
        echo "   echo 'export PATH=\"\$HOME/.npm-global/bin:\$PATH\"' >> $RC_FILE"
    fi
    echo "   source $RC_FILE"
    echo ""
fi

echo "✅ ORBIT installed successfully!"
echo ""
echo "🚀 Run: orbit --help"
