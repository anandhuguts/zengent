#!/bin/bash
echo "Starting Code Lens v2..."
echo ""

# Set environment variable for Mac/Linux
export NODE_ENV=development

# Start the application
npx tsx server/index.ts
