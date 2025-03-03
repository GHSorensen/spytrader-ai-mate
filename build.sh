
#!/bin/bash

# Exit on error
set -e

# Prevent Python-related build steps
export POETRY_VIRTUALENVS_CREATE=false
export PIP_NO_PYTHON_VERSION_WARNING=1
export PYTHON_VERSION=none

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

# Note: We don't modify package.json.override as it's a protected file
# Instead, we'll ensure all required dependencies are installed directly

echo "Build completed successfully"
