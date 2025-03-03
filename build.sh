
#!/bin/bash

# Exit on error
set -e

# Prevent Python-related build steps
export POETRY_VIRTUALENVS_CREATE=false
export PIP_NO_PYTHON_VERSION_WARNING=1

# Make it clear we're using Node.js
echo "Node version:"
node --version
echo "NPM version:"
npm --version

# Run the build process
npm install
npm run build

# Apply any package.json overrides if they exist
if [ -f package.json.override ]; then
  jq -s '.[0] * .[1]' package.json package.json.override > package.json.tmp && mv package.json.tmp package.json
fi

echo "Build completed successfully"
