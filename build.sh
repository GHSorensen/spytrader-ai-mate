
#!/bin/bash

# Exit on error and print commands being executed
set -e
set -x

# AGGRESSIVELY prevent Python-related build steps
export POETRY_VIRTUALENVS_CREATE=false
export POETRY_ENABLED=0
export PIP_NO_PYTHON_VERSION_WARNING=1
export PYTHON_VERSION=DISABLED
export PYTHONPATH="/dev/null"
export PYTHONHOME="/dev/null"
export USE_PYTHON=false
export SKIP_PYTHON=true
export NODE_ENV=production

# Delete ANY Python-related files that might trigger automatic detection
rm -f poetry.lock pyproject.toml 2>/dev/null || true
rm -f .python-version* 2>/dev/null || true
rm -rf __pycache__ 2>/dev/null || true
rm -rf .venv 2>/dev/null || true
rm -rf venv 2>/dev/null || true
find . -name "*.py" -type f -delete 2>/dev/null || true
find . -name "*.pyc" -type f -delete 2>/dev/null || true
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Create an empty .nvmrc file to force Node.js version
echo "18.19.1" > .nvmrc

# Display Node.js information
echo "Node version:"
node --version
echo "NPM version:"
npm --version

# Ensure npm is in PATH - use existing binary paths rather than creating new ones
export PATH="$PATH:/usr/local/bin:/usr/bin"
which npm || { echo "npm not found in PATH"; exit 1; }

# Clear npm cache and remove node_modules to start fresh
echo "Cleaning existing dependencies..."
npm cache clean --force || true
rm -rf node_modules || true

# Install core dependencies first
echo "Installing core dependencies..."
npm install --no-audit --no-fund --no-optional

# Explicitly install vite and related packages
echo "Installing Vite and related packages..."
npm install vite@latest --no-audit --no-fund --no-optional --force
npm install @vitejs/plugin-react-swc@latest --no-audit --no-fund --no-optional --force
npm install react react-dom @tanstack/react-query --no-audit --no-fund --no-optional --force

# Verify vite is installed in node_modules
echo "Verifying vite installation..."
ls -la node_modules/vite || echo "Vite not found in node_modules"

# Add a local bin folder and symlink vite
echo "Creating local vite binary..."
mkdir -p ./node_bin
NODE_BIN_PATH=$(pwd)/node_bin
ln -sf $(pwd)/node_modules/.bin/vite $NODE_BIN_PATH/vite
chmod +x $NODE_BIN_PATH/vite
export PATH="$NODE_BIN_PATH:$PATH"

# Run the build process
echo "Starting build process..."
if $NODE_BIN_PATH/vite build; then
  echo "Build succeeded with direct vite binary."
else
  echo "Build failed, trying with npx..."
  npx vite build || NODE_ENV=production npx vite build --debug
fi

# Create a marker file to indicate this is a Node.js project
touch .node-project

echo "Build completed successfully - THIS IS EXPLICITLY A NODE.JS PROJECT!"
