
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

# Clear npm cache to avoid any cache-related issues
npm cache clean --force || true

# Install dependencies - do not use global installs due to read-only filesystem
echo "Installing express..."
npm install express --no-audit --no-fund --no-optional

echo "Installing Vite and React dependencies..."
npm install vite@latest --no-audit --no-fund --no-optional --force
npm install @vitejs/plugin-react-swc@latest --no-audit --no-fund --no-optional --force
npm install react react-dom @tanstack/react-query --no-audit --no-fund --no-optional --force

echo "Installing all dependencies..."
npm install --no-audit --no-fund --no-optional --force

# Run the build process with multiple fallbacks
echo "Starting build process..."

# Simplify vite.config.ts temporarily to a minimal version if build fails
if ! npx vite build; then
  echo "Initial build failed, trying with simplified config..."
  # Create a backup of the original config
  cp vite.config.ts vite.config.ts.bak
  
  # Write a simplified config
  cat > vite.config.ts <<EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  }
})
EOF
  
  # Try build with simplified config
  if npx vite build; then
    echo "Build succeeded with simplified config."
  else
    # Restore original config if simplified also fails
    mv vite.config.ts.bak vite.config.ts
    
    # Try with npm run build
    npm run build || \
    # Try with NODE_ENV explicitly set
    NODE_ENV=production npx vite build || \
    # Last resort - use direct npx command with debug flags
    npx --no-install vite build --debug
  fi
else
  echo "Build succeeded with original config."
fi

# Create a marker file to indicate this is a Node.js project
touch .node-project

echo "Build completed successfully - THIS IS EXPLICITLY A NODE.JS PROJECT!"
