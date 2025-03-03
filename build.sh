
#!/bin/bash

# Exit on error
set -e

# Prevent Python-related build steps
export POETRY_VIRTUALENVS_CREATE=false
export POETRY_ENABLED=false
export PIP_NO_PYTHON_VERSION_WARNING=1
export PYTHON_VERSION=false
export PYTHONPATH="none"
export PYTHONHOME="none"
export USE_PYTHON=false
export SKIP_PYTHON=true

# Delete any Python-related files that might trigger automatic detection
rm -f poetry.lock pyproject.toml .python-version 2>/dev/null || true

# Make it clear we're using Node.js
echo "Node version:"
node --version
echo "NPM version:"
npm --version

# Install necessary dependencies explicitly
npm install express

# Run the build process
npm install
npm run build

echo "Build completed successfully - This is a Node.js project!"
