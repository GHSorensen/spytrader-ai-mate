
#!/bin/bash

# Exit on error
set -e

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

# Install necessary dependencies
npm install express
npm install

# Run the build process
npm run build

# Create a marker file to indicate this is a Node.js project
touch .node-project

echo "Build completed successfully - THIS IS EXPLICITLY A NODE.JS PROJECT!"
