# PowerShell startup script for Code Lens v2
Write-Host "Starting Code Lens v2..." -ForegroundColor Green
Write-Host ""

# Set environment variable
$env:NODE_ENV = "development"

# Start the application
npx tsx server/index.ts
