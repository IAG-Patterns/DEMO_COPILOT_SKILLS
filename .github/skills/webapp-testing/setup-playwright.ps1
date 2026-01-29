# PowerShell script to set up Playwright for AviaBiz Dashboard
# Run this from the project root: .\.github\skills\webapp-testing\setup-playwright.ps1

Write-Host "Setting up Playwright for AviaBiz Dashboard..." -ForegroundColor Cyan

# Install Playwright
Write-Host "`nInstalling Playwright..." -ForegroundColor Yellow
npm install -D @playwright/test

# Install browsers
Write-Host "`nInstalling Playwright browsers..." -ForegroundColor Yellow
npx playwright install

# Install accessibility testing
Write-Host "`nInstalling accessibility testing tools..." -ForegroundColor Yellow
npm install -D @axe-core/playwright

# Copy config file
Write-Host "`nCopying Playwright config..." -ForegroundColor Yellow
Copy-Item ".\.github\skills\webapp-testing\playwright.config.ts" ".\playwright.config.ts" -Force

# Create tests directory
Write-Host "`nCreating tests directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".\tests" -Force | Out-Null

# Add test scripts to package.json
Write-Host "`nDone! Add these scripts to your package.json:" -ForegroundColor Green
Write-Host @"

"scripts": {
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "test:headed": "playwright test --headed",
  "test:debug": "playwright test --debug",
  "test:codegen": "playwright codegen http://localhost:3000",
  "test:report": "playwright show-report"
}

"@ -ForegroundColor White

Write-Host "`nRun 'npm run test:ui' to start visual debugging!" -ForegroundColor Cyan
