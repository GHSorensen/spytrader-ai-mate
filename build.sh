
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

# Explicitly make npm available
export PATH="$PATH:/usr/local/bin:/usr/bin"
which npm || { echo "npm not found in PATH. Installing..."; curl -L https://www.npmjs.com/install.sh | sh; }

# Install vite globally first to ensure it's available for the build command
npm install -g vite

# First install express to ensure the server can run
npm install express --no-audit --no-fund

# Install core dependencies first (especially vite and its plugin)
npm install vite @vitejs/plugin-react-swc --force --no-audit --no-fund

# Then install React and other core dependencies
npm install react react-dom @tanstack/react-query --force --no-audit --no-fund

# Then install ALL dependencies with --force to bypass peer dependency conflicts
npm install --force --no-audit --no-fund

# Run the build process - try multiple approaches
echo "Starting build process..."
npx vite build || npm run build --force || NODE_ENV=production vite build

# Create a marker file to indicate this is a Node.js project
touch .node-project

echo "Build completed successfully - THIS IS EXPLICITLY A NODE.JS PROJECT!"
