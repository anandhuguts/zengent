@echo off
echo Starting Code Lens v2...
echo.

REM Set environment variable for Windows
set NODE_ENV=development

REM Start the application
npx tsx server/index.ts
