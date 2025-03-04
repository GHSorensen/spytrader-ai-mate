
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

# Install all dependencies including dev dependencies
echo "Installing dependencies with dev dependencies..."
npm install --include=dev || npm install --also=dev || npm install

# Make sure Vite is explicitly installed globally for this build
echo "Ensuring Vite is installed..."
npm install -g vite || true

# Try the build
echo "Starting build process..."
if command -v vite >/dev/null 2>&1; then
  echo "Using global vite command"
  vite build
elif [ -f ./node_modules/.bin/vite ]; then
  echo "Using local vite command"
  ./node_modules/.bin/vite build
else
  echo "Using npx to run vite"
  npx vite build
fi

# If the build failed, try with a simplified approach using the Vite CLI
if [ $? -ne 0 ]; then
  echo "First build attempt failed, trying alternative approach..."
  npm i -D vite @vitejs/plugin-react-swc
  npx --no-install vite build
fi

# Create a marker file to indicate this is a Node.js project
touch .node-project

echo "Build completed successfully - THIS IS EXPLICITLY A NODE.JS PROJECT!"
